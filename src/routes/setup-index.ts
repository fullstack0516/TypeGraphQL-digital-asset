import { Request, Response } from 'express';
import { mongooseDb } from '../helpers/mongodb';
import { pageCollectionName } from '../models/page_model';

export const setupIndexes = async (req: Request, res: Response) => {

    // Page indexes
    await mongooseDb.connection.db.collection(pageCollectionName).dropIndexes()
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ uid: 1 }, { unique: true })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ url: 1 }, { unique: true })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ url: 1, siteUid: 1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ siteUid: 1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ siteUid: 1, totalVisits: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ siteUid: 1, totalVisits: -1, createdIso: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ siteUid: 1, createdIso: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, lastUpdateIso: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ totalVisits: -1, })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ createdIso: -1, })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ createdIso: -1, totalVisits: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ contentCategories: 1, totalVisits: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ siteUid: -1, createdIso: -1, isDeleted: 1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, contentCategories: 1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, contentCategories: 1, createdIso: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, createdIso: -1, contentCategories: 1, totalVisits: -1 })
    await mongooseDb.connection.db.collection(pageCollectionName).createIndex({ isFlagged: 1, isBanned: 1, isPublished: 1, lastUpdateIso: -1, contentCategories: 1 })

    return res.json({ status: 'done' }).end()
}
