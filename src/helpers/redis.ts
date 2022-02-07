import { RedisPubSub } from 'graphql-redis-subscriptions'
import { Config } from './config'
import { isDev } from './helpers'
import Redis from 'ioredis'

export let redisPubSub: RedisPubSub

export const initRedisPubSub = (): RedisPubSub => {
    if (isDev()) {
        redisPubSub = new RedisPubSub({ publisher: new Redis() })
        return redisPubSub
    }
    // @ts-ignore
    redisPubSub = new RedisPubSub({ connection: Config.redis })
    return redisPubSub
}
