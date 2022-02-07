import rateLimit from 'express-rate-limit'
import { isDev } from '../helpers/helpers'
import { getProjectId } from '../helpers/config'
import { RouteError } from './route-error'

const rateLimitDisabled = false

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const rateLimitReachStatusCode = 'rate-limit-reached'
const rateLimitReachStatusMessage = 'The rate limit has been reached'

// @ts-ignore
const skipTestMode = (req, res) => {
    if (isDev() || rateLimitDisabled || getProjectId() === 'awake-d48d9') {
        return true
    }
    return false
}

export const getRateLimit = (args: { numberOfRequests: number; timeWindowMinutes: number }) => {
    return rateLimit({
        windowMs: args.timeWindowMinutes * 60 * 1000,
        max: args.numberOfRequests,
        // @ts-ignore
        handler: (req, res, next) => {
            throw new RouteError(rateLimitReachStatusCode, rateLimitReachStatusMessage)
        },
        skip: skipTestMode,
    })
}
