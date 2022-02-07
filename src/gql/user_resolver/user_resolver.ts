import 'reflect-metadata'
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import { createUid, isProduction } from '../../helpers/helpers'
import { createJwt } from '../../helpers/auth'
import { UserLight } from '../../models/user_light_model'
import { ApolloError } from 'apollo-server-errors'
import { User, UserModel } from '../../models/user_model'
import { searchUsers } from './search_users'
import { updateUser as updateUserF } from './update_user'
import { fetchUser as fetchUserF } from './fetch_user'
import { WebsiteStatus, WebsiteStatusModel } from '../../models/website_status'
import { fetchSubscribedSites as fetchSubscribedSitesF } from './fetch_subscribed_sites'
import { checkUserSubscription } from './check_user_subscription'
import { fetchMyData as fetchMyDataF } from './fetch_my_data'
import { setCategoryBlacklisted as setCategoryBlacklistedF } from './set_category_blacklisted'
import { setCategoryUnblacklisted as setCategoryUnblacklistedF } from './set_category_unblacklisted'
import { getBlacklistedCategories as getBlacklistedCategoriesF } from './get_blacklisted_categories'
import { BlacklistedDataCategory } from '../../models/blacklisted_data_category'
import { countOfDataPoints } from './count_of_data_points'
import { checkJwt } from '../../helpers/auth'
import RateLimit from '../rate-limiter'
import { deleteUserSites } from './delete_user_sites'
import { randomDummyProfilePhoto } from '../../helpers/helpers_photos'
import { isTestMode } from '../../helpers/helpers'
import { signUp } from './sign_up'
import { checkEmailToken } from '../../helpers/helper_emails'
import { createUserLight } from './create_user_light'
import { createEmailToken } from '../../helpers/helper_emails'
import { sendMail } from '../../helpers/helper_emails'
import { deleteFileViaUrl } from '../../helpers/helper_storage'
import {
    sendPhoneNumberForCode,
    retryVerification,
    confirmSMSCode as confirmSMSCodeF,
} from '../../helpers/sms'
import { MediaLinkInputType } from '../../models/media_link'
import { MustBeLoggedIn } from '../admin_resolver/requires_login'
import { ListOfSites } from '../site_resolver/site_resolver'
import { CountResult } from '../admin_resolver/admin_resolver'

@Resolver(User)
export class UserResolver {
    constructor() { }

    @Query((returns) => CountResult, {
        description: 'Fetches count of the users data points',
    })
    @MustBeLoggedIn()
    async fetchDataPointsCount(@Ctx('user') user: User) {
        const count = await countOfDataPoints(user.uid)
        return { count }
    }

    @Query((returns) => WebsiteStatusResult, {
        description: 'Fetches website status.',
    })
    async fetchWebsiteStatus() {
        const websiteStatus = await WebsiteStatusModel.findOne({ uid: 'initialisation' })
        if (!websiteStatus) {
            // create the maintenance document
            const maintenance = {
                uid: 'initialisation',
                mode: 'online',
                isUnderMaintenance: false,
                maintenanceMessageForUsers: 'The website is under maintenance. Please try again in 5 minutes.',
            }
            await WebsiteStatusModel.create(maintenance)
            return { websiteStatus: maintenance }
        }
        return { websiteStatus }
    }

    @Query(() => Boolean, {
        description: 'Check if the username exists or not',
    })
    async checkUsernameExist(@Arg('username') username: string) {
        return !!(await UserModel.findOne({ username }));
    }

    @Mutation((returns) => SendSMSCodeResult, {
        description: 'Send SMS',
    })
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async sendSmsCode(@Arg('phoneNumber') phoneNumber: string) {
        // Check if the old user exists.
        const oldUser = await UserModel.findOne({ phoneNumber })
        if (oldUser) {
            if (isTestMode()) {
                return { oldUser, jwt: await createJwt(oldUser.uid) }
            }
            if ((phoneNumber as string).includes('+19999') && !isProduction()) {
                return { verificationCode: '9999', userExists: true }
            }
            const verificationCode = await sendPhoneNumberForCode(phoneNumber)
            return { verificationCode, userExists: true }
        } else {
            const verificationCode = await sendPhoneNumberForCode(phoneNumber)
            return { verificationCode, userExists: false }
        }
    }

    @Mutation(() => String, {
        description: 'Resend SMS',
    })
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async resendSmsCode(
        @Arg('verificationId') verificationId: string,
        @Arg('phoneNumber') phoneNumber: string,
    ) {
        return await retryVerification(verificationId, phoneNumber);
    }

    @Mutation((returns) => ConfirmSMSCodeResult, {
        description: 'Confirm SMS',
    })
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async confirmSMSCode(
        @Arg('smsCode') smsCode: string,
        @Arg('verificationId') verificationId: string,
        @Arg('phoneNumber') phoneNumber: string,
        @Arg('username', { nullable: true }) username?: string
    ) {
        if (!isTestMode() && !(phoneNumber as string).includes('+19999')) {
            await confirmSMSCodeF(smsCode, verificationId)
        }
        let user = (await UserModel.findOne({ phoneNumber })) as User
        if (!user && !username) {
            throw new ApolloError('no-user-exists', 'No user exists with this combination. And a username was not provided.')
        } else if (username) {
            user = await signUp(username, phoneNumber)
        }
        const jwt = await createJwt(user.uid)
        return { user, jwt }
    }

    // Send verification code in order to change the SMS
    @Mutation((returns) => ConfirmChangeSMSResult, {
        description: 'Send verification code in order to change the SMS. Throw: "not-logged-in", "sms-code-incorrect", "sms-confirm-failed"',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async confirmChangeSMS(
        @Arg('phoneNumber') phoneNumber: string,
        @Arg('verificationId') verificationId: string,
        @Arg('smsCode') smsCode: string,
        @Ctx('user') user: User
    ) {
        if (!isTestMode()) {
            await confirmSMSCodeF(smsCode, verificationId)
        }
        // update the user information with new phone number
        await updateUserF(user.uid, { phoneNumber: phoneNumber })
        return { SMSVerified: true }
    }

    // Search for users
    @Query((returns: any) => [UserLight], {
        description: 'Search for users, returning a userlight. User light is a safe public version of the user.',
    })
    @MustBeLoggedIn()
    async searchUsers(@Arg('searchTerm') searchTerm: string) {
        return await searchUsers(searchTerm)
    }

    // Update the user
    @Mutation((returns) => UserResult, {
        description: 'Updates the user profile data.',
    })
    async updateUser(
        @Arg('origin') origin: string,
        @Ctx('user') user: User,
        @Arg('username', { nullable: true }) username?: string,
        @Arg('email', { nullable: true }) email?: string,
        @Arg('bio', { nullable: true }) bio?: string,
        @Arg('phoneNumber', { nullable: true }) phoneNumber?: string,
        @Arg('profileMedia', { nullable: true }) profileMedia?: MediaLinkInputType,
        @Arg('lastOpenedAppIso', { nullable: true }) lastOpenedAppIso?: string
    ) {
        const newEmail = email
        const updatedUser = {
            username,
            email,
            bio,
            phoneNumber,
            profileMedia,
            lastOpenedAppIso,
        }
        // we don't update the email information soon
        // it will be updated when the user will confirm the email address
        delete updatedUser.email
        await updateUserF(user.uid, updatedUser)
        // if email was changed, we need to confirm email address
        if (newEmail && user.email !== newEmail) {
            // generate the token for email confirmation
            const emailToken = await createEmailToken(user.uid, newEmail)
            const emailConfirmLink = `${origin}/confirm-email?code=${emailToken}`

            const mailOptions = {
                from: 'Awake',
                to: newEmail,
                subject: 'Hello ✔',
                text: 'Please click the following link to confirm your backup email.',
                html: '<h2>Email Confirmation link <a href="' + emailConfirmLink + '">here</a></h2>',
            }
            await sendMail(mailOptions)
        }

        return { user: await fetchUserF(user.uid) }
    }

    @Query((returns) => UserResult, {
        description: 'Fetchs user profile data, private. Must be logged in.',
    })
    @MustBeLoggedIn()
    async fetchUser(@Ctx('user') user: User) {
        return { user: user }
    }

    @Query((returns) => UserLightResult, {
        description: 'Fetch userlight data. User light is a public safe version of the user.',
    })
    async fetchUserLight(@Arg('userLightUid') userLightUid: string) {
        const user = await fetchUserF(userLightUid)
        if (!user) {
            throw new ApolloError('no-user-exists', 'No user exists with this combination.')
        }
        const userLight = createUserLight(user)
        return { userLight }
    }

    @Mutation((returns) => UserResult, {
        description: 'Confirms the backup email for the user.',
    })
    @MustBeLoggedIn()
    async confirmBackupEmail(@Arg('code') code: string) {
        const res = await checkEmailToken(code)
        // update the user information
        await updateUserF(res.user.uid, { email: res.email })
        return { user: await fetchUserF(res.user.uid) }
    }

    @Query((returns) => ListOfSites, {
        description: 'Fetchs the subscribed sites for the logged in user.',
    })
    @MustBeLoggedIn()
    async fetchSubscribedSites(@Ctx('user') user: User) {
        const sites = await fetchSubscribedSitesF(user.uid)
        return {
            sites,
        }
    }

    @Query(() => CheckSubscribedSiteResult, {
        description: 'Checks if the user subscribed to the site (free, not paid)',
    })
    @MustBeLoggedIn()
    async checkSubscribedSite(@Arg('siteUid') siteUid: string, @Ctx('user') user: User) {
        const isSubscribed = await checkUserSubscription(user.uid, siteUid)
        return { isSubscribed }
    }

    @Query((returns) => FetchMyDataResult, {
        description: 'Fetch My Data. This will fetch the users data tags.',
    })
    @MustBeLoggedIn()
    async fetchMyData(@Arg('fromIso') fromIso: string, @Ctx('user') user: User, @Arg('category', { nullable: true }) category?: string) {
        return await fetchMyDataF(user.uid, { fromIso: fromIso, category: category })
    }

    @Mutation((returns) => String, { description: 'Set a site/page category blacklisted so the user does not get data-tags from it.' })
    @MustBeLoggedIn()
    async setCategoryBlacklisted(@Arg('categoryName') categoryName: string, @Ctx('user') user: User) {
        await setCategoryBlacklistedF(categoryName, user.uid)
        return 'success'
    }

    @Mutation((returns) => String, {
        description: 'Set a site/page category unblacklisted so the user does get data-tags from it.',
    })
    @MustBeLoggedIn()
    async setCategoryUnblacklisted(@Arg('categoryName') categoryName: string, @Ctx('user') user: User) {
        await setCategoryUnblacklistedF(categoryName, user.uid)
        return 'success'
    }

    @Query(() => BlacklistedDataCategoriesResult, {
        description: 'Get blacklisted categories for the user logged in.',
    })
    @MustBeLoggedIn()
    async getBlacklistedCategories(@Ctx('user') user: User) {
        const blacklistedCategories = await getBlacklistedCategoriesF(user.uid)
        return { blacklistedCategories }
    }

    @Query((returns) => String, { description: 'Check if the users auth JWT token is valid.' })
    async checkValidToken(@Arg('jwt') jwt: string) {
        try {
            await checkJwt(jwt)
            return 'success'
        } catch (e) {
            throw new ApolloError('invalid-token', 'This is invalid JWT token')
        }
    }

    @Mutation((returns) => UserResult, { description: 'Allows the user to delete their data, all their informaiton including sites and pages.' })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async deleteSelf(@Ctx('user') user: User) {
        await deleteFileViaUrl(user.profileMedia.url)
        await updateUserF(user.uid, {
            username: ('deleted-' + createUid()).substr(0, 16),
            phoneNumber: '+999' + createUid(),
            profileMedia: randomDummyProfilePhoto(),
        })
        await deleteUserSites(user.uid)
        const updatedUser = await fetchUserF(user.uid)
        return { user: updatedUser }
    }
}

@ObjectType({ description: 'The result from sending a phone number.' })
class SendSMSCodeResult {
    @Field({
        description: "The verification code used to verify the device, is used for step two. 'SignupWithSms'",
    })
    verificationCode!: string
    @Field({
        description: 'Are they already a user? If not, they must enter a name|username|fullname on signup.',
    })
    userExists!: boolean
}
@ObjectType({ description: 'The data from signing up' })
class ConfirmSMSCodeResult {
    @Field()
    user!: User
    @Field()
    jwt!: string
}

@ObjectType({ description: 'The boolean value representing whether sms is changed or not' })
class ConfirmChangeSMSResult {
    @Field()
    SMSVerified!: boolean
}

@ObjectType({ description: 'Fetchs the user profile data. Private.' })
class UserResult {
    @Field()
    user!: User
}

@ObjectType({ description: 'Returns the website status. This can indicate if it is down or not (for maintanence).' })
class WebsiteStatusResult {
    @Field()
    websiteStatus!: WebsiteStatus
}

@ObjectType({ description: 'Fetch my data result.' })
class FetchMyDataResult {
    @Field(() => String, { description: "{[categoryName: string]: DataTag[]}" })
    myData!: string
    @Field(() => Number)
    count!: number
}

@ObjectType({ description: 'Check if the user is subscribed (free sites)' })
class CheckSubscribedSiteResult {
    @Field()
    isSubscribed!: boolean
}

@ObjectType()
class UserLightResult {
    @Field()
    userLight!: UserLight
}

@ObjectType()
class BlacklistedDataCategoriesResult {
    @Field(() => [BlacklistedDataCategory])
    blacklistedCategories!: [BlacklistedDataCategory]
}
