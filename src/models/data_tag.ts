import { modelOptions, prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'A data tag contains information about content types. We collection data-tags from sites/pages using ML.' })
export class DataTag {
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
}
