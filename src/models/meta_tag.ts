import { modelOptions, prop } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'Users can create the metaTag from the page-edit' })
export class MetaTag {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, minlength: 1, type: () => String })
    @Field()
    tagString!: string

    @prop({ validate: validateIsoFormat, required: true, type: () => String })
    @Field()
    tagCreatedIso!: string
}
