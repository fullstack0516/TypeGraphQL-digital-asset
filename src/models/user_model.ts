import 'reflect-metadata'
import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'
import { MediaLink } from './media_link'

export const userCollectionName = 'users'

@index({ uid: 1 }, { unique: true })
@index({ username: 1 }, { unique: false })
@modelOptions({ schemaOptions: { collection: userCollectionName } })
@ObjectType({ description: 'The main user object' })
export class User {
    @prop({ unique: true, required: true, type: () => String, })
    @Field()
    uid!: string

    @prop({ required: true, maxlength: 17, minlength: 2, type: () => String, })
    @Field({ description: 'Can be a username, fullname or just first name.', })
    username!: string

    @prop({ maxlength: 512, minlength: 0, type: () => String })
    @Field({ nullable: true })
    bio?: string

    @prop({ type: () => String, })
    @Field({ description: 'Email is provided as a backup.', nullable: true })
    email?: string

    @prop({ type: () => MediaLink })
    @Field()
    profileMedia!: MediaLink

    // TODO: need to be back later
    // @prop({ required: true, type: () => any })
    // @Field(() => any, { description: 'The user who reported this user + why.' })
    // reports!: { [userUid: string]: string } // or object

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    lastOpenedAppIso!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    createdIso!: string

    @prop({ required: true, type: () => Boolean })
    @Field()
    isBanned!: boolean

    @prop({ required: true, type: () => Boolean })
    @Field()
    isDeleted!: boolean

    @prop({ required: true, type: () => Boolean })
    @Field()
    isFlagged!: boolean

    @prop({ unique: true, required: true, minlength: 3, type: () => String, })
    @Field({ description: "Phone number with area code, such as '+4791273911'", })
    phoneNumber!: string

    @prop({ required: true, min: 0, type: () => Number })
    @Field({ description: 'Their total visits across sites.' })
    totalVisitsOnSites!: number

    @prop({ required: true, min: 0, type: () => Number })
    @Field({ description: 'Their total impressions across sites.' })
    totalImpressionsOnSites!: number

    @prop({ required: true, type: () => Boolean })
    @Field()
    isAdmin!: boolean
}

export const UserModel = getModelForClass(User)
