import { modelOptions, prop } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, InputType, ObjectType } from 'type-graphql'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'The link to some media, can be a photo or video.' })
export class MediaLink {
    @prop({ type: () => String })
    @Field(() => String, { description: 'The url to the media' })
    url!: string
    @prop({ type: () => String })
    @Field(() => String, { description: 'The media type' })
    type!: 'photo' | 'video'
}

@InputType({ description: 'The data for updating a live stream object. Usually an internal link.' })
export class MediaLinkInputType {
    @Field()
    url!: string
    @Field()
    type!: 'photo' | 'video'
}
