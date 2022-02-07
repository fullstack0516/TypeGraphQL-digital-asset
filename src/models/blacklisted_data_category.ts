import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose'
import { Field, ObjectType } from 'type-graphql'

export const blacklistedDataCategoryCollectionName = 'blacklistedCategories'

@modelOptions({ schemaOptions: { collection: blacklistedDataCategoryCollectionName } })
@ObjectType({ description: 'Black list data category' })
export class BlacklistedDataCategory {
    @prop({ unique: true, required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    category!: string
}

export const BlacklistedDataCategoryModel = getModelForClass(BlacklistedDataCategory)
