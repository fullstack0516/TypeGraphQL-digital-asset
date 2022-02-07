import * as express from 'express'
import { mongooseDb } from '../helpers/mongodb'
import { Page } from '../models/page_model'

/**
 * convert the dataTags from map to array
 */
const updateDataTags = async () => {
    const pageCollection = mongooseDb.connection.db.collection("pages")

    // pageCollection.dropIndex('dataTags.uid_1')
    pageCollection.dropIndexes()

    // @ts-ignore
    const pages: Page[] = await pageCollection.find().toArray()

    for (const page of pages) {
        await pageCollection.updateOne({ uid: page.uid }, {
            $set: {
                // @ts-ignore
                dataTags: Object.values(page.dataTags),
            },
        })
    }
}

/**
 * add the dislikes property in pages
 * update the likes property value
 */
const addDislikesProperty = async () => {
    const pageCollection = mongooseDb.connection.db.collection("pages")
    const pageLikesCollection = mongooseDb.connection.db.collection("pages.likes")

    pageCollection.dropIndexes()

    // @ts-ignore
    const pages: Page[] = await pageCollection.find().toArray()

    for (const page of pages) {
        const likes = await pageLikesCollection.find({ pageUid: page.uid, liked: 1 }).count()
        const dislikes = await pageLikesCollection.find({ pageUid: page.uid, liked: -1 }).count()

        await pageCollection.updateOne({ uid: page.uid }, {
            $set: {
                likes: likes,
                dislikes: dislikes
            },
        })
    }
}

export const updateSchema = async (req: express.Request, res: express.Response) => {
    // await updateDataTags()
    await addDislikesProperty()

    return res.send('success')
}
