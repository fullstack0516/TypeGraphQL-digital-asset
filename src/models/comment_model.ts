import 'reflect-metadata'
import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat, } from '../helpers/typegoose_helpers'
import { ContentText, } from './content_section'
import { UserLight } from './user_light_model'

export const commentCollectionName = 'comments'

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: commentCollectionName } })
@ObjectType({ description: 'A comment is user generated with content created by them.' })
export class Comment {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field()
    pageUid!: string

    @prop({ required: true, type: () => UserLight })
    @Field(() => UserLight)
    author!: UserLight

    @prop({ type: () => ContentText })
    @Field({ description: 'markdown & html for content' })
    content!: ContentText

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field({ description: 'When a comment was last edited.' })
    lastUpdateIso!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field({ description: 'When the comment was created.' })
    createdIso!: string

    @prop({ type: () => Boolean })
    @Field()
    isDeleted!: boolean

    @prop({ type: () => Boolean })
    @Field()
    isBanned!: boolean

    @prop({ type: () => Boolean })
    @Field()
    isFlagged!: boolean

    @prop({ min: 0, type: () => Number, required: true })
    @Field()
    numberOfReports!: number

    @prop({ min: 0, type: () => Number, required: true, })
    @Field({ description: 'count of replies' })
    count!: number

    @prop({ type: () => String })
    @Field()
    parent!: string

    @prop({ required: true, type: () => Number })
    @Field()
    likes!: number

    @prop({ required: true, type: () => Number })
    @Field()
    dislikes!: number

    // It is not included in database property
    @Field(() => Number, { nullable: true, description: 'check if loggedin user liked/disliked the specific comment.' })
    userLiked?: number
}

export const CommentModel = getModelForClass(Comment)
