import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

export const pageHistoryCollectionName = 'pages.history'

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: pageHistoryCollectionName } })
@ObjectType({ description: 'Records the page history of users.' })
export class PageHistory {
    @prop({ required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    pageUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    siteUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    pageUrl!: string

    @prop({ required: true, type: () => String })
    @Field()
    siteUrl!: string

    @prop({ required: true, type: () => Number })
    @Field()
    numberOfVisits!: number

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    createdIso!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    lastUpdateIso!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    lastPagePublishIso!: string
}

export const PageHistoryModel = getModelForClass(PageHistory)
