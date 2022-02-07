import { ApolloServer, ExpressContext } from 'apollo-server-express'
import { GraphQLSchema, execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

export let subscriptionServer: SubscriptionServer

export const createSubscriptionServer = (args: { schema: GraphQLSchema; apolloServer: ApolloServer<ExpressContext>; httpServer: any }) => {
    const { schema, apolloServer, httpServer } = args

    subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
        },
        {
            server: httpServer,
            path: apolloServer.graphqlPath,
        }
    )
}
