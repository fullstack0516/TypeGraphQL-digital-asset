import 'reflect-metadata'
import { Ctx, Field, ObjectType, Query, Resolver } from 'type-graphql'
import { User } from '../../models/user_model'
import { MustBeLoggedIn } from '../admin_resolver/requires_login'

@Resolver()
export class CoinResolver {
    constructor() { }

    @Query(() => Number, { description: 'fetch the coin amount for logged in user' })
    @MustBeLoggedIn()
    async fetchUsersCoinAmount(
        @Ctx('user') user: User
    ) {
        return 0.7285
    }
}
