import { ApolloError } from 'apollo-server-errors'
import { UseMiddleware } from 'type-graphql'
import { redisPubSub } from '../helpers/redis'

const rateLimitReachStatusCode = 'rate-limit-reached'
const rateLimitReachStatusMessage = 'The rate limit has been reached'

export default function RateLimit({ timeWindowMinutes, numberOfRequests }) {
    return UseMiddleware(async ({ info: { variableValues, fieldName }, context }, next) => {
        const visitorKey = context.user ? 'user:' + context.user.id : 'ip:' + context.ip

        // generate the key to save the number of requests for specific api
        const key: string = ['limit', fieldName, visitorKey].join(':')
        const oldRecord = await redisPubSub.getPublisher().get(key)
        if (oldRecord) {
            if (parseInt(oldRecord) >= numberOfRequests) {
                throw new ApolloError(rateLimitReachStatusCode, rateLimitReachStatusMessage)
            } else {
                await redisPubSub.getPublisher().incr(key)
            }
        } else {
            // Redis 'value' related to 'key' will be expired(null) after 'timeWindowMinutes' time was passed
            await redisPubSub.getPublisher().set(key, '1', 'EX', timeWindowMinutes * 60)
        }
        return next()
    })
}
