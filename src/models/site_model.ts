import 'reflect-metadata'
import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { MediaLink } from './media_link'
import { validateColor, validateIsoFormat, validateURL } from '../helpers/typegoose_helpers'

export const siteCollectionName = 'sites'

@index({ uid: 1 }, { unique: true })
@index({ url: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: siteCollectionName } })
@ObjectType({ description: 'A site has multiple pages on it. It is used as a root for user content.' })
export class Site {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, minlength: 2, maxlength: 70, type: () => String })
    @Field({ description: 'Can be a site name.' })
    name!: string

    @prop({ required: true, type: () => MediaLink })
    @Field()
    siteIcon!: MediaLink

    @prop({ maxlength: 512, type: () => String })
    @Field({ description: 'What is the site about;', nullable: true })
    description?: string

    @prop({ unique: true, validate: validateURL, required: true, type: () => String })
    @Field({ description: "The url the user wants for the site under our domain. The url is alpha-numeric with hypthens only '-'." })
    url!: string

    @prop({ min: 0, required: true, type: () => Number })
    @Field()
    totalImpressions!: number

    @prop({ min: 0, required: true, type: () => Number })
    @Field()
    totalVisits!: number

    @prop({ min: 0, required: true, type: () => Number })
    @Field({ description: 'The total ad earnings in USD.' })
    totalEarnings!: number

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field({ description: 'When a site was last updated.' })
    lastSiteUpdatedIso!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field({ description: "The users who control the site an it's pages." })
    createdIso!: string

    @prop({ type: () => Boolean, required: true })
    @Field()
    isDeleted!: boolean

    @prop({ type: () => Boolean, required: true })
    @Field()
    isBanned!: boolean

    @prop({ type: () => [String] })
    @Field(() => [String])
    siteOwnersUids!: string[]

    @prop({ validate: validateColor, type: () => String })
    @Field({ nullable: true })
    siteColor?: string
}

export const SiteModel = getModelForClass(Site)
