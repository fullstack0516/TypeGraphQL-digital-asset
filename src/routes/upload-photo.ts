import * as express from 'express'
import { Config } from '../helpers/config'
import * as fs from 'fs'
import { uploadImageToStorage } from '../helpers/helper_storage'
import Joi = require('joi')
import sharp from 'sharp'
import { createUid } from '../helpers/helpers'
import axios from 'axios'
import { RouteError } from './route-error'

const scheme = Joi.object({
    resizeHeight: Joi.number().min(24).max(2080).optional(),
})

/**
 * @api {post} /upload-photo Upload photo
 * @apiDescription Upload a photo and get a url.
 * @apiName uploadPhoto
 * @apiGroup Util
 * @apiParamExample {json} Request-Example:
 * {
 *     // If this is not provided; it will use 720.
 *     resizeHeight?: number,
 * }
 * @apiPermission []
 * @apiSuccess {String} url URL of the photo.
 */
export const uploadPhoto = async (req: express.Request, res: express.Response) => {
    try {
        await scheme.validateAsync(req.body)

        // @ts-ignore
        const file = req?.file

        if (!file) {
            throw new RouteError('no-file', 'No file was uploaded')
        }

        let height = req.body?.resizeHeight
        if (!height) {
            height = 720
        } else {
            height = parseInt(height)
        }

        await sharp(file.path)
            .resize({
                fit: sharp.fit.contain,
                height,
            })
            .jpeg({ quality: 90 })
            .toFile(file.path + '_compress.jpg')

        const base64 = await fs.readFileSync(file.path + '_compress.jpg', {
            encoding: 'base64',
        })

        try {
            await validateFaceOnVisionAPI(base64)
        } catch (e) {
            throw new RouteError('invalid-photo', 'The photo failed validation on the vision API.')
        }

        const path = 'photos/' + createUid()
        const uplaodedFile = await uploadImageToStorage(path, base64, '.jpg')

        await uplaodedFile.makePublic()
        const metaData = await uplaodedFile.getMetadata()
        const url = metaData[0].mediaLink

        fs.unlinkSync(file.path)
        fs.unlinkSync(file.path + '_compress.jpg')

        return res.status(200).json(url)
    } catch (e) {
        throw e
    }
}

const validateFaceOnVisionAPI = async (base64Image: string): Promise<any> => {
    const requestData = {
        requests: [
            {
                image: {
                    content: base64Image,
                },
                features: [
                    {
                        type: 'LABEL_DETECTION',
                    },
                    {
                        type: 'SAFE_SEARCH_DETECTION',
                    },
                ],
            },
        ],
    }

    const url = 'https://vision.googleapis.com/v1/images:annotate?key=' + Config.googleCloudApiKey

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    }

    const result = await axios.post(url, requestData, { headers })

    const visionResponse = result.data.responses as [any]
    visionResponse.forEach((vision) => {
        // Filter children, no kids.
        let childDetected = false
        if (vision.labelAnnotations) {
            // Check for child percentage.
            vision.labelAnnotations.forEach((label: any) => {
                if (label.description === 'Child' || label.description === 'Toddler') {
                    // Over X%
                    if (label.score > 0.7) {
                        childDetected = true
                    }
                }
            })

            if (childDetected) {
                throw 'Child was detected in the photo.'
            }
        }

        // Check the picture isn't bad.
        const safeSearchAnnotation = vision.safeSearchAnnotation
        if (safeSearchAnnotation) {
            if (safeSearchAnnotation.violence === 'POSSIBLE' || safeSearchAnnotation.violence === 'LIKELY' || safeSearchAnnotation.violence === 'VERY_LIKELY') {
                throw 'Photo was potencially violent'
            }
            if (safeSearchAnnotation.adult === 'POSSIBLE' || safeSearchAnnotation.adult === 'LIKELY' || safeSearchAnnotation.adult === 'VERY_LIKELY') {
                throw 'Photo was potencially adult'
            }
        }
    })
}
