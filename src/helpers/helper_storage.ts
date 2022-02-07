import { createUid } from './helpers'
import { Config } from './config'
import * as gcs from '@google-cloud/storage'
import { isTestMode } from './helpers'
import * as urlUtil from 'url'
import { ApolloError } from 'apollo-server-errors'
import { greyImage } from './config'
import { logError } from './logger'
import { MediaLink } from '../models/media_link'

export const storage = new gcs.Storage()

export const uploadImageToStorage = async (storagePath: string, base64Image: string, customExtention = ''): Promise<any> => {
    const photoPath = storagePath + createUid() + customExtention

    // Save the base64 to storage.
    const file = storage.bucket(Config.cloudStorage).file(photoPath)

    await file.save(new Buffer(base64Image, 'base64'), {
        metadata: { contentType: base64MimeType(base64Image) },
        public: true,
        validation: 'md5',
    })

    return file
}

export const deleteFileViaUrl = async (url: string) => {

    /**
     * Don't delete dummys or grey.
     */
    if (checkDummyProfilePhotosUrl(Config.dummyProfilePhotos, url) ||
        url === greyImage || url.includes('picsum.photos')) {
        if (isTestMode()) {
            console.log('deleteFileViaUrl: Was dummy file | picsum | greybg.')
        }
        return true;
    }

    const urlDecoded = urlUtil.parse(url)
    if (!urlDecoded.path) {
        throw new ApolloError('no-url-exists', 'There is no url.');
    }
    const photosPath = urlUtil.parse(urlDecoded.path.split('/')[urlDecoded.path.split('/').length - 1])

    if (!photosPath.pathname) {
        throw new ApolloError('no photo-url-exists', 'There is no photo url.');
    }

    const fileName = decodeURIComponent(photosPath.pathname)

    try {
        const file = storage.bucket(Config.cloudStorage).file(fileName);
        if (!file.exists()) {
            throw 'file does not exist, url: ' + url;
        }
        await file.delete()
        return true;
    } catch (e) {
        logError('Could not delete file from storage. Url: ' + url, { e })
    }
}

const base64MimeType = (encoded: any): string => {
    let result = ''
    if (typeof encoded !== 'string') {
        return result ?? ''
    }
    const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
    if (mime && mime.length) {
        result = mime[1] ?? ''
    }
    return result ?? ''
}

const checkDummyProfilePhotosUrl = (photoArray: Array<MediaLink>, url: string): boolean => {
    for (const photo of photoArray) {
        if (photo.url === url) {
            return true
        }
    }
    return false;
}

