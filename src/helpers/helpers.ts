import { mongooseDb } from './mongodb'
import crypto from 'crypto'
import * as showdown from 'showdown'

export const isProduction = () => {
    return process.env.NODE_ENV === 'production'
}

export const isDev = () => {
    return process.env.NODE_ENV === 'dev'
}

const lut: any = []; for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
export const createUid = (): string => {
    const d0 = Math.random() * 0xffffffff | 0;
    const d1 = Math.random() * 0xffffffff | 0;
    const d2 = Math.random() * 0xffffffff | 0;
    return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff]
}

export const createUidLonger = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Checks the collection until it has a unique uid.
 */
export const createUniqueUid = async (collectionName: string) => {
    let uid = createUid()
    let exists = await mongooseDb.connection.db.collection(collectionName).findOne({ uid })
    while (exists) {
        uid = createUid()
        exists = await mongooseDb.connection.db.collection(collectionName).findOne({ uid })
    }
    return uid
}

/**
 * Checks the collection until it has a unique uid.
 */
export const createUniqueUidLonger = async (collectionName: string) => {
    let uid = createUidLonger()
    let exists = await mongooseDb.connection.db.collection(collectionName).findOne({ uid })
    while (exists) {
        uid = createUidLonger()
        exists = await mongooseDb.connection.db.collection(collectionName).findOne({ uid })
    }
    return uid
}

export const hashPassword = (password: string) => {
    return crypto.createHash('sha256').update(password!).digest('base64')
}

export const deleteUndefinedKeys = (anyObject: any): any => {
    Object.keys(anyObject).forEach((key: any) => (anyObject[key] === undefined || anyObject[key] === null ? delete anyObject[key] : ''))
    return anyObject
}

export async function asyncForEach<T>(array: Array<T>, callback: (item: T, index: number) => void) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index)
    }
}

export const isTestMode = (): boolean => {
    return !!process.env.TEST_MODE;
}

const showDownConverter = new showdown.Converter();

export const markdownToHtml = (markdown: string) => {
    return showDownConverter.makeHtml(markdown)
}

