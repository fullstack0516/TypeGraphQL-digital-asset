import { Request, Response } from 'express';
import * as gcs from '@google-cloud/storage';
import { Config } from '../helpers/config';
import { createUid } from '../helpers/helpers';
import { PublicFiles } from '../helpers/public_files';

type Payload = {
  fileName: string;
  fileType: string;
  pageUid: string;
  sectionUid: string;
};

/**
 * @api {post} /create-file-upload-url Create a file upload url
 * @apiName createFileUploadUrl
 * @apiGroup Util
 */
export const createFileUploadUrl = async (req: Request, res: Response) => {
  const storage = new gcs.Storage({
    credentials: {
      client_email: Config.clientEmail,
      private_key: Config.privateKey
    }
  });

  const bucket = storage.bucket(Config.cloudStorage);

  // Works when enabled once for a bucket.
  // await bucket.setCorsConfiguration([
  //   {
  //     method: ['GET', 'PUT', 'POST', 'HEAD'],
  //     origin: ['http://localhost:3000/'],
  //     responseHeader: ['Content-Type'],
  //     maxAgeSeconds: 3600
  //   }
  // ]);

  const tempFileName = `temp/temp_${createUid()}`;
  const file = bucket.file(tempFileName);

  const { pageUid, sectionUid, fileType, fileName } = req.body as Payload;

  const fileUploadSpace = await file.getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 6 * 60 * 60 * 1000,
    contentType: fileType
  });

  // get content url and bucket
  const finalDestination = `page-${pageUid}/section-${sectionUid}/video-${fileName}/hd.mp4`;
  await bucket.upload(PublicFiles.Empty, {
    destination: finalDestination,
    private: false,
    public: true
  });
  const storageBucket = Config.cloudStorage.replace('gs://', '');
  const cloudFile = bucket.file(finalDestination);
  await cloudFile.makePublic();
  await cloudFile.setMetadata({ metadata: { processing: true } });

  const finalUrl = `${cloudFile.storage.apiEndpoint}/${storageBucket}/${finalDestination}`;

  return res.json({
    tempUploadUrl: fileUploadSpace[0],
    tempFileName,
    finalUrl,
    finalDestination
  });
};
