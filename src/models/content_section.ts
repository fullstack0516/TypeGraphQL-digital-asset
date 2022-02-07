import { modelOptions, prop } from '@typegoose/typegoose'
import { Length } from 'class-validator'
import { createUnionType, Field, ObjectType } from 'type-graphql'
import { MediaLink } from './media_link'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'The text content, markdown and html' })
export class ContentText {
    @prop({ required: true, type: () => String })
    @Field(() => String, { defaultValue: '' })
    markdown!: string
    @prop({ required: true, type: () => String })
    @Field(() => String, { defaultValue: '' })
    html!: string
}

// Header
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of text as a header, used for displaying on pages' })
export class ContentHeader {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => ContentText })
    @Field(() => ContentText)
    text!: ContentText
}

// Text Block
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of text, used for displaying on pages.' })
export class ContentTextBlock {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => ContentText })
    @Field(() => ContentText)
    text!: ContentText
}

// Text Image Right
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of an image on the right and text.' })
export class ContentTextImageRight {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => ContentText })
    @Field(() => ContentText)
    text!: ContentText
    @prop({ required: true, type: () => MediaLink })
    @Field(() => MediaLink)
    image!: MediaLink
}

// Text Image Left
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of image on the left and text.' })
export class ContentTextImageLeft {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => ContentText })
    @Field(() => ContentText)
    text!: ContentText
    @prop({ required: true, type: () => MediaLink })
    @Field(() => MediaLink)
    image!: MediaLink
}

// Image Row
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of images on a row.' })
export class ContentImageRow {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => MediaLink })
    @Field(() => MediaLink)
    image!: MediaLink
}

// Triple Image col
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of 3 images. Large on top, 2 smaller below.' })
export class ContentTripleImageCol {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => [MediaLink] })
    @Field(() => [MediaLink], {})
    @Length(3)
    images!: MediaLink[]
}

// Video Row Embed
@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A content block of an embeded video. Like YouTube for example.' })
export class ContentVideoRowEmbed {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: false, type: () => String })
    @Field(() => String, { nullable: true })
    link?: string
}

// Video Block
@ObjectType({ description: 'A content block of a video.' })
export class ContentVideoBlock {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => ContentText })
    @Field(() => ContentText)
    text!: ContentText
    @prop({ required: true, type: () => MediaLink })
    @Field(() => MediaLink)
    video!: MediaLink
    @prop({ required: true, type: () => String })
    @Field(() => String)
    title!: string
    @prop({ required: true, type: () => Boolean })
    @Field(() => Boolean)
    processing!: boolean
}

export type ContentSectionTypes = 'header' | 'text-block' | 'text-image-right' | 'text-image-left' | 'image-row' | 'video-row-embed-only' | 'video-block' | 'triple-image-col'
export type ContentTypes =
    | ContentHeader
    | ContentTextBlock
    | ContentTextImageRight
    | ContentTextImageLeft
    | ContentImageRow
    | ContentVideoRowEmbed
    | ContentVideoBlock
    | ContentTripleImageCol

export const ContentTypeUnion = createUnionType({
    name: 'ContentTypeVariation',
    types: () => [ContentHeader, ContentTextBlock, ContentTextImageRight, ContentTextImageLeft, ContentImageRow, ContentVideoRowEmbed, ContentVideoBlock, ContentTripleImageCol],
    resolveType: (value) => {
        // @ts-ignore
        if (Object.keys(value).includes('link')) {
            return 'ContentVideoRowEmbed'
        }
        // @ts-ignore
        if (Object.keys(value).includes('video')) {
            return 'ContentVideoBlock'
        }
        // @ts-ignore
        if (Object.keys(value).includes('images')) {
            return 'ContentTripleImageCol'
        }
        // @ts-ignore
        if (Object.keys(value).includes('image') && Object.keys(value).includes('text')) {
            return 'ContentTextImageLeft'
        }
        // @ts-ignore
        if (Object.keys(value).includes('image') && !Object.keys(value).includes('text')) {
            return 'ContentImageRow'
        }
        // @ts-ignore
        if (Object.keys(value).includes('text')) {
            return 'ContentTextBlock'
        }
        return undefined
    },
})

// The main holder for the content sections.
@modelOptions({ schemaOptions: { _id: false, autoIndex: false }, options: { allowMixed: 0 } })
@ObjectType({ description: 'A generic content section, it can have multiple types.' })
export class ContentSection<ContentTypes> {
    @prop({ required: true, type: () => String })
    @Field(() => String)
    uid!: string
    @prop({ required: true, type: () => String })
    @Field()
    type!: ContentSectionTypes
    @prop({ required: true })
    @Field(() => ContentTypeUnion)
    content!: ContentTypes
}
