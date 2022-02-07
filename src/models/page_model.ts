import 'reflect-metadata'
import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateColor, validateIsoFormat, validateURL } from '../helpers/typegoose_helpers'
import { ContentSection, ContentTypes } from './content_section'
import { DataTag } from './data_tag'
import { MetaTag } from './meta_tag'

export const pageCollectionName = 'pages'

@index({ uid: 1 }, { unique: true })
@index({ url: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: pageCollectionName } })
@ObjectType({ description: 'A page is user generated page with content created by them.' })
export class Page {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, maxlength: 70, minlength: 2, type: () => String })
    @Field()
    title!: string

    @prop({ type: () => String })
    @Field({ description: 'Used for the meta data. In search for example.' })
    description!: string

    @prop({ type: () => String })
    @Field({ description: 'The site that owns this page.' })
    siteUid!: string

    @prop({ unique: true, validate: validateURL, type: () => String })
    @Field({ description: 'The url the user wants for the page under our domain. The url is alpha-numeric with hypthens only "-"' })
    url!: string

    @prop({ min: 0, type: () => Number })
    @Field()
    totalImpressions!: number

    @prop({ min: 0, type: () => Number })
    @Field()
    totalVisits!: number

    @prop({ min: 0, type: () => Number })
    @Field({ description: 'The total ad earnings in USD.' })
    totalEarnings!: number

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field({ description: 'When a page was last updated.' })
    lastUpdateIso!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field({ description: 'When a page was last published.' })
    lastPublishIso!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field({ description: 'When the page was created.' })
    createdIso!: string

    // TODO: need to change the DB of production since we changed type from map to unique array
    @prop({ required: true, type: () => [DataTag] })
    @Field(() => [DataTag], { description: 'The page data-tags we create automatically.' })
    dataTags!: DataTag[] // old Type: { [tagString: string]: DataTag }

    @prop({ required: true, type: () => [MetaTag] })
    @Field(() => [MetaTag], { description: 'The page user-meta-tags poster created.' })
    userMetaTags!: MetaTag[]

    @prop({ required: true, type: () => [String] })
    @Field(() => [String], { description: 'This is generated automatically via the ML.' })
    contentCategories!: string[]

    @prop({ type: () => [ContentSection] })
    @Field(() => [ContentSection], { description: 'The content sections in order.' })
    contentSections!: ContentSection<ContentTypes>[]

    @prop({ type: () => [ContentSection] })
    @Field(() => [ContentSection], { description: 'When the user publishes the draft section overwrites the contentSections.' })
    contentDraftSections!: ContentSection<ContentTypes>[]

    @prop({ type: () => Boolean })
    @Field()
    isDeleted!: boolean

    @prop({ type: () => Boolean })
    @Field()
    isBanned!: boolean

    @prop({ type: () => Boolean })
    @Field({ description: 'If the page has been flagged.' })
    isPublished!: boolean

    @prop({ type: () => Boolean })
    @Field()
    isFlagged!: boolean

    @prop({ min: 0, type: () => Number, required: true })
    @Field()
    numberOfReports!: number

    @prop({ required: true, validate: validateColor, type: () => String })
    @Field()
    pageColor!: string

    @prop({ required: true, type: () => Number })
    @Field()
    likes!: number

    @prop({ required: true, type: () => Number })
    @Field()
    dislikes!: number

    @prop({ required: true, type: () => String })
    @Field({ description: 'author' })
    pageOwner!: string
}

export const PageModel = getModelForClass(Page)
