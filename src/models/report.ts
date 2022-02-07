import { prop, getModelForClass, modelOptions, index } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'
import { validateIsoFormat } from '../helpers/typegoose_helpers'

export const reportCollectionName = 'pages.reports'

@index({ uid: 1 }, { unique: true })
@modelOptions({ schemaOptions: { collection: reportCollectionName } })
@ObjectType({ description: 'The users reports to the page' })
export class Report {
    @prop({ required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field()
    userUid!: string

    @prop({ required: true, type: () => String })
    @Field()
    pageUid!: string

    @prop({ required: true, minlength: 10, type: () => String })
    @Field()
    reasonDesc!: string

    @prop({ required: true, validate: validateIsoFormat, type: () => String })
    @Field()
    createdIso!: string
}

export const ReportModel = getModelForClass(Report);
