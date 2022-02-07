import { MediaLink } from '../models/media_link'
import { Config } from './config'

export const randomDummyProfilePhoto = (): MediaLink => {
    return Config.dummyProfilePhotos[Math.floor(Math.random() * Config.dummyProfilePhotos.length)]
}

export const addDummyIfNoPhotos = (mediaLinks: Array<MediaLink>): Array<MediaLink> => {
    if (mediaLinks) {
        if (Array.isArray(mediaLinks)) {
            if (mediaLinks.length === 0) {
                mediaLinks.push(randomDummyProfilePhoto())
            }
            return mediaLinks
        } else {
            mediaLinks = []
            mediaLinks.push(randomDummyProfilePhoto())
            return mediaLinks
        }
    }
    return [randomDummyProfilePhoto()]
}
