import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

export const subscriptionCollectionName = 'subscriptions'

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: subscriptionCollectionName } })
@ObjectType({ description: 'The users subscription to the site. Not paid free.' })
export class Subscription {
    @prop({ required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    siteUid!: string

    @prop({ required: true, type: () => String, validate: validateIsoFormat })
    @Field()
    subscriptionIso!: string
}

export const SubscriptionModel = getModelForClass(Subscription)
