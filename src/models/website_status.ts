import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose'
import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'

export const websiteStatusCollectionName = 'websiteStatus'

@modelOptions({ schemaOptions: { collection: websiteStatusCollectionName } })
@ObjectType({ description: 'Describe whether the site is online, offline, maintenance and so on.' })
export class WebsiteStatus {
    @prop({ required: true, type: () => String })
    @Field()
    uid!: string

    @prop({ required: true, type: () => String })
    @Field({ description: 'Site status' })
    mode!: 'online' | 'offline'

    @prop({ required: true, type: () => Boolean })
    @Field()
    isUnderMaintenance!: boolean

    @prop({ required: true, type: () => String })
    @Field()
    maintenanceMessageForUsers!: string
}

export const WebsiteStatusModel = getModelForClass(WebsiteStatus)
