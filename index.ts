import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express'
import { initMongo } from './src/helpers/mongodb'
import { attachUserObject, customAuthChecker } from './src/helpers/auth'
import http from 'http'
import { isDev } from './src/helpers/helpers'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './src/gql/user_resolver/user_resolver'
import { initSMS } from './src/helpers/sms'
import { getProjectId, initConfig } from './src/helpers/config'
import { ApolloServerPluginLandingPageProductionDefault, ApolloServerPluginLandingPageLocalDefault, PluginDefinition } from 'apollo-server-core'
import apolloWinstonLoggingPlugin from './src/helpers/apollo_winston_logging_plugin'
import { createExpressApp } from './src/routes/routes-index'
import { initRedisPubSub } from './src/helpers/redis'
import cors from 'cors'
import { createSubscriptionServer, subscriptionServer } from './src/helpers/subscription_helpers'
import { CommonResolver } from './src/gql/common_resolver/common_resolver'
import { PageResolver } from './src/gql/page_resolver/page_resolver'
import { SiteResolver } from './src/gql/site_resolver/site_resolver'
import { AdminResolver } from './src/gql/admin_resolver/admin_resolver'
import { DummyContentResolver } from './src/gql/dummy_content_resolver/dummy_content_resolver'
import { CoinResolver } from './src/gql/coin_resolver/coin_resolver'
import { CommentResolver } from './src/gql/comment_resolver/comment_resolver'

const initServer = async () => {
    await initConfig()
    await initSMS()
    await initMongo()
    initRedisPubSub()
}

const startServers = async () => {
    try {
        await initServer()

        const schema = await buildSchema({
            resolvers: [
                UserResolver,
                CommonResolver,
                PageResolver,
                SiteResolver,
                AdminResolver,
                CoinResolver,
                CommentResolver,
                DummyContentResolver,
            ],
            authChecker: customAuthChecker,
        })

        // Base expres app
        const app = createExpressApp()
        app.use(
            cors({
                origin: '*',
            })
        )

        // For the playground.
        const introspectionProductId = 'awake-d48d9'

        // Allow our dev services to have query.
        const getExplorer = () => {
            // Dev and local
            if (getProjectId() === introspectionProductId || isDev()) {
                return ApolloServerPluginLandingPageLocalDefault({ footer: false })
            }
            // Prod
            return ApolloServerPluginLandingPageProductionDefault({ footer: false })
        }

        // Plugins
        const plugins: PluginDefinition[] = []
        plugins.push(getExplorer())
        plugins.push({
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close()
                    },
                }
            },
        })
        if (!isDev()) {
            plugins.push(apolloWinstonLoggingPlugin())
        }

        // Apollo Server Settings
        const apolloServer = new ApolloServer({
            schema,
            // Create the app wide context.
            context: async ({ req }) => {
                const user = await attachUserObject(req)
                if (user) {
                    return {
                        user,
                    }
                }
                return {}
            },
            plugins: plugins,
            introspection: getProjectId() === introspectionProductId || isDev(),
        })
        await apolloServer.start()

        // For Localhost SSL stuff
        const httpServer = http.createServer(app)

        // Subscription server
        createSubscriptionServer({ schema, apolloServer: apolloServer, httpServer })

        // Apply the base app.
        apolloServer.applyMiddleware({ app })

        // Listen for requests
        const port = process.env.PORT || 4000
        await new Promise<void>((resolve) => httpServer.listen({ port }, resolve))
        console.log(`🚀  Server ready at http://localhost:${port}\nFor Playground visit: http://localhost:${port}/graphql`)
    } catch (e) {
        console.error(e)
    }
}

startServers()
