import { Request, Response } from 'express'
import { ValidationError } from 'joi'
import { enumerateErrorFormat, logger } from '../helpers/logger'
import { isDev } from '../helpers/helpers'

export const errorHandler = (error: any, req: Request, res: Response, next: any) => {
    if (res.headersSent) {
        return next(error)
    }

    if (error.isRouteError) {
        const message: any = {}

        message.statusCode = error.statusCode
        message.details = error.details

        if (error.clientData) {
            message.clientData = error.clientData
        }

        res.status(500).send(message)
        logRouteError(req, res, error)
        return
    }

    // For Joi validation errors
    if (error instanceof ValidationError) {
        logRouteError(req, res, error)
        res.status(500).json({
            statusCode: 'invalid-fields',
            message: error?.message ?? 'no-message',
        })
        return
    }

    logRouteError(req, res, error)
    res.status(500).json({
        message: error?.message ?? 'no-message',
    })
}

const logRouteError = (req: Request, res: Response, error: any) => {
    if (isDev()) {
        console.log({ error })
    }

    let type: string = 'error'

    if (error.logAsInfo) {
        type = 'info'
    }

    // Get werid TS errors if we try to use type. Also for some reason we need to force string again..
    // @ts-ignore
    logger.log((type as string), req.originalUrl, {
        error: enumerateErrorFormat(error),
        body: req.body,
        httpRequest: {
            status: res.statusCode,
            requestUrl: req.url,
            requestMethod: req.method,
            remoteIp: req.connection.remoteAddress,
        },
    })
}
