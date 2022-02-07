import 'reflect-metadata'
import { Field, ObjectType } from 'type-graphql'

@ObjectType({ description: 'Get the minimum version of the platform. If the user is behind, show a blocking screen with these messages.' })
export class MinimuimVersion {
    @Field({ description: 'Title to show users' })
    customTitle!: string

    @Field({ description: 'Custom message like "Come back in 15 minutes"' })
    customMessage!: string

    @Field({ description: 'The current minimum build.' })
    minBuildNumber!: number
}
