import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

export const pageLikeCollectionName = 'pages.likes'

@modelOptions({ schemaOptions: { collection: pageLikeCollectionName } })
@ObjectType({ description: 'If the user likes the page or not. Recorded.' })
export class PageLike {
    @prop({ required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    pageUid!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    createdIso!: string

    @prop({ type: () => Number })
    @Field({ description: '-1: disliked, 0: no action, 1: liked' })
    liked!: -1 | 0 | 1
}

export const PageLikeModel = getModelForClass(PageLike)
