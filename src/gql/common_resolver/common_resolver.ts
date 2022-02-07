import 'reflect-metadata'
import { Query, Resolver } from 'type-graphql'
import { MinimuimVersion } from '../../models/minimum_version'
import { getMinimumVersion } from './minimum_version'

@Resolver()
export class CommonResolver {
    constructor() { }

    // Get the minimum platform version
    @Query(() => MinimuimVersion, {
        description: 'The minimum build version of the platform',
    })
    async minimumBuildVersion() {
        return getMinimumVersion()
    }
}
