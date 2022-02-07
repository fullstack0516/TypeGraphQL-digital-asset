import express from 'express'
import router from 'express-promise-router'
import { Config } from '../helpers/config'
import { logger } from '../helpers/logger'
import { errorHandler } from './error-handler'
import { getRateLimit } from './rate-limiter'
import { uploadMiddleware } from './upload-middleware'
import { uploadPhoto } from './upload-photo'
import { updateSchema } from './update-schema'
import cors from 'cors'
import { setupIndexes } from './setup-index'
import { backupDatabase } from './backup-database'
import { processVideo } from './process-video'
import { createFileUploadUrl } from './create-file-upload-url'

export const createExpressApp = (): express.Express => {
    // Rest Routes
    const app = express()
    app.use(
        cors({
            origin: '*',
        })
    )
    app.use(express.json({ limit: '150mb' }))
    app.use(express.urlencoded({ extended: true }))
    const routes = router()
    // Log the routes.
    routes.use((req, res, next) => {
        logger.info(req.originalUrl)
        next()
    })
    routes.get('/', (req, res) =>
        res.send({
            projectId: Config.productCode,
            projectName: Config.productName,
            status: 'ok',
        })
    )
    app.use('/', routes)
    routes.post('/upload-photo', getRateLimit({ numberOfRequests: 10, timeWindowMinutes: 1 }), uploadMiddleware.single('photo'), uploadPhoto)
    routes.post('/process-video', processVideo)
    routes.post('/create-file-upload-url', createFileUploadUrl)
    routes.get('/setup-index', setupIndexes)
    routes.get('/update-schema', updateSchema)
    routes.get('/backup-db', backupDatabase)
    routes.use(errorHandler)

    return app
}
