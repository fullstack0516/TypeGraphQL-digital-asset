import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'
import { MediaLink } from './media_link'
import { MaxLength, MinLength } from 'class-validator'
import { modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { _id: false, autoIndex: false } })
@ObjectType({ description: 'The lightweight version of the user, hides fields that should not be exposed.' })
export class UserLight {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ unique: true, required: true, type: () => String })
    @Field(() => String, { nullable: false })
    @MaxLength(40)
    @MinLength(2)
    username!: string

    @prop({ required: true, type: () => MediaLink })
    @Field()
    profileMedia!: MediaLink
}
