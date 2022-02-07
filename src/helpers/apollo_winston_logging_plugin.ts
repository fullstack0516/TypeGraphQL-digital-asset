import { nanoid } from 'nanoid'
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base'
import winston from 'winston'
import { logger } from './logger'

const stringify = (obj: unknown) => JSON.stringify(obj)

interface Options {
    config?: {
        didEncounterErrors?: boolean
        didResolveOperation?: boolean
        executionDidStart?: boolean
        parsingDidStart?: boolean
        responseForOperation?: boolean
        validationDidStart?: boolean
        willSendResponse?: boolean
        requestDidStart?: boolean
    }

    winstonInstance?: winston.Logger

    levels?: {
        debug?: string
        info?: string
        error?: string
    }
}

const apolloWinstonLoggingPlugin = (opts: Options = {}): ApolloServerPlugin => {
    const {
        didEncounterErrors = true,
        didResolveOperation = false,
        executionDidStart = false,
        parsingDidStart = false,
        responseForOperation = false,
        validationDidStart = false,
        willSendResponse = true,
        requestDidStart = true,
    } = opts.config || {}

    const { winstonInstance = logger } = opts

    return {
        // @ts-ignore
        requestDidStart(context) {
            const id = nanoid()
            const { query, operationName, variables } = context.request
            if (requestDidStart) {
                winstonInstance.log(
                    "info",
                    stringify({
                        id,
                        event: 'request',
                        operationName,
                        query: query?.replace(/\s+/g, ' '),
                        variables,
                    })
                )
            }
            const handlers: GraphQLRequestListener = {
                // @ts-ignore
                didEncounterErrors({ errors }) {
                    if (didEncounterErrors) {
                        winstonInstance.log("error", stringify({ id, event: 'errors', errors }))
                    }
                },
                // @ts-ignore
                willSendResponse({ response }) {
                    if (willSendResponse) {
                        winstonInstance.log(
                            "debug",
                            stringify({
                                id,
                                event: 'response',
                                response: response.data,
                            })
                        )
                    }
                },
                // @ts-ignore
                didResolveOperation(ctx) {
                    if (didResolveOperation) {
                        winstonInstance.log(
                            "debug",
                            stringify({
                                id,
                                event: 'didResolveOperation',
                                ctx,
                            })
                        )
                    }
                }, // @ts-ignore
                executionDidStart(ctx) {
                    if (executionDidStart) {
                        winstonInstance.log("debug", stringify({ id, event: 'executionDidStart', ctx }))
                    }
                },
                // @ts-ignore
                parsingDidStart(ctx) {
                    if (parsingDidStart) {
                        winstonInstance.log("debug", stringify({ id, event: 'parsingDidStart', ctx }))
                    }
                },
                // @ts-ignore
                validationDidStart(ctx) {
                    if (validationDidStart) {
                        winstonInstance.log("debug", stringify({ id, event: 'validationDidStart', ctx }))
                    }
                },
                // @ts-ignore
                responseForOperation(ctx) {
                    if (responseForOperation) {
                        winstonInstance.log(
                            "debug",
                            stringify({
                                id,
                                event: 'responseForOperation',
                                ctx,
                            })
                        )
                    }
                    return null
                },
            }
            return handlers
        },
    }
}

export default apolloWinstonLoggingPlugin
