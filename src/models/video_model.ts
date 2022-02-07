import 'reflect-metadata'
import { prop, getModelForClass, modelOptions, index, mongoose } from '@typegoose/typegoose'
import { createUnionType, Field, ObjectType } from 'type-graphql'

export const videoProcessingCollectionName = 'video.processing.queue'

export type VIDEO_STATUS = 'PROGRESS' | 'FAILED' | 'COMPLETED' | 'REJECTED'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false }, options: { allowMixed: 0 } })
@ObjectType({ description: 'Frame object' })
export class Frame {
  @prop({ type: () => String })
  @Field(() => String)
  time?: string

  @prop({ type: () => String })
  @Field(() => String)
  likelihood?: string
}

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: videoProcessingCollectionName } })
@ObjectType({ description: 'The main video processing object' })
export class Video {
    @prop({ unique: true, required: true, type: () => String, })
    @Field()
    uid!: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    fileName?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    tempFileName?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    pageUid?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    sectionUid?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    finalDestination?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    finalUrl?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    transcoderStatus?: VIDEO_STATUS

    @prop({ type: () => String })
    @Field({ nullable: true })
    transcoderJobId?: string

    @prop({ type: () => String })
    @Field({ nullable: true })
    intelligenceStatus?: VIDEO_STATUS

    @prop({ type: () => [Frame] })
    @Field(() => [Frame], { description: 'Array of failed frames' })
    failedFrames?: Frame[]

    @prop({ required: true, type: () => Number })
    @Field()
    created!: number

    @prop({ required: true, type: () => Number, default: Date.now() })
    @Field()
    updated!: number

    @prop({ type: () => Boolean })
    @Field()
    isDeleted?: boolean
}

export const VideoModel = getModelForClass(Video)
