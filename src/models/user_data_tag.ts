import { prop, modelOptions, index, getModelForClass } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

export const userDataTagCollectionName = 'userDataTags'

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: userDataTagCollectionName } })
@ObjectType({ description: 'The user data-tag is a data-tag converted to user storage so they can see their own data-tags and data content.' })
export class UserDataTag {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, minlength: 1, type: () => String })
    @Field()
    tagString!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field()
    tagCreatedIso!: string

    @prop({ required: true, type: () => Number })
    @Field()
    tagScore!: number

    @prop({ type: () => [String!] })
    @Field(() => [String!])
    contentCategories!: string[]

    @prop({ required: true, type: () => Number })
    @Field()
    count!: number

    @prop({ required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field()
    tagRecordedForUserIso!: string

    @prop({ required: true, type: () => String })
    @Field()
    companyId!: string
}

export const UserDataTagModel = getModelForClass(UserDataTag)
