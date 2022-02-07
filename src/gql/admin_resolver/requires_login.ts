import { UseMiddleware } from "type-graphql"
import { ApolloError } from "apollo-server-errors"

export function MustBeLoggedIn() {
    return UseMiddleware(async ({ context }, next) => {
        if (!context.user) {
            throw new ApolloError('not-logged-in', 'The user must be logged in to do this.')
        }
        return next()
    })
}
