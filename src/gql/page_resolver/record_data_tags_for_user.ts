import { fetchPage } from "./fetch_page";
import { ApolloError } from "apollo-server-errors";
import { BlacklistedDataCategory, BlacklistedDataCategoryModel } from "../../models/blacklisted_data_category";
import { fetchUser } from "../user_resolver/fetch_user";
import { UserDataTag, UserDataTagModel } from "../../models/user_data_tag";
import { createUid } from "../../helpers/helpers";

export const recordDataTagsForUser = async (pageUid: string, userUid: string) => {
    const page = await fetchPage(pageUid)
    const dataTags = page.dataTags

    if (dataTags.length === 0) {
        throw new ApolloError('no-data-tags', 'The page had no data tags.')
    }

    const blacklisted: BlacklistedDataCategory[] = await BlacklistedDataCategoryModel.find({
        userUid,
    })

    // Check the user exists.
    const user = await fetchUser(userUid)

    const userDataTags: UserDataTag[] = []

    dataTags.forEach((dataTag) => {
        const userDataTag: UserDataTag = {
            uid: createUid(),
            contentCategories: dataTag.contentCategories,
            count: dataTag.count,
            tagCreatedIso: dataTag.tagCreatedIso,
            tagRecordedForUserIso: new Date().toISOString(),
            tagScore: dataTag.tagScore,
            tagString: dataTag.tagString,
            userUid: user.uid,
            companyId: 'awake'
        }
        let blacklistedTag = false;
        blacklisted.forEach((categoryBlackListed) => {
            userDataTag.contentCategories.forEach((newTagCategory) => {
                if (categoryBlackListed.category == newTagCategory) {
                    blacklistedTag = true;
                }
            })
        })
        if (!blacklistedTag) {
            // It's not black listed.
            userDataTags.push(userDataTag)
        }
    })

    if (userDataTags.length !== 0) {
        await UserDataTagModel.insertMany(userDataTags)
    }
}
