import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path'
import { Config } from '../helpers/config';
import { asyncForEach } from '../helpers/helpers';
import { storage } from '../helpers/helper_storage';
import { mongooseDb } from '../helpers/mongodb'

export const backupDatabase = async (req: Request, res: Response) => {
    const collections = await mongooseDb.connection.db.collections()

    const data: { [collectionName: string]: Array<any> } = {};

    await asyncForEach(collections, async (collection) => {
        const items = await collection.find({}).toArray();
        if (!data[collection.collectionName]) {
            data[collection.collectionName] = [];
        }
        items.forEach((eachItem) => {
            data[collection.collectionName].push(eachItem);
        });
    });

    const fileName = `mongo-backup-${new Date().toISOString()}.json`;
    const filePath = `backups/${fileName}`;

    fs.mkdirSync('backups', { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data));

    // TODO: comment for now.
    // await storage.bucket(Config.cloudStorage).upload(filePath, {
    //     destination: filePath,
    // });

    return res.json({ success: filePath });
};