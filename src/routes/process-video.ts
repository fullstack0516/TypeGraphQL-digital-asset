import { Request, Response } from 'express';
import * as gcs from '@google-cloud/storage';
import { getProjectId, Config } from '../helpers/config';

import { logError, logger } from '../helpers/logger';

import { RouteError } from './route-error';
import { mongooseDb } from '../helpers/mongodb';
import { createUid } from '../helpers/helpers';

const { TranscoderServiceClient } = require('@google-cloud/video-transcoder').v1;
const videoIntelligence = require('@google-cloud/video-intelligence').v1;
const videoIntelligenceClient = new videoIntelligence.VideoIntelligenceServiceClient();

const storage = new gcs.Storage();

const overlayImageUri = 'gs://awake-d48d9.appspot.com/photos/45a90398551c4ccaa2c2f263815186683f094e94984453b0.jpg';

const transcoderConfigWithAudio = {
  elementaryStreams: [
    {
      key: 'video-stream1',
      videoStream: {
        h264: {
          heightPixels: 720,
          widthPixels: 1280,
          bitrateBps: 2500000,
          frameRate: 30,
          profile: 'high',
          tune: '',
          preset: 'veryfast',
          pixelFormat: 'yuv420p',
          rateControlMode: 'vbr',
          enableTwoPass: false,
          crfLevel: 21,
          vbvSizeBits: 2500000,
          vbvFullnessBits: 2250000,
          allowOpenGop: false,
          entropyCoder: 'cabac',
          bPyramid: false,
          bFrameCount: 3,
          aqStrength: 1
        }
      }
    },
    {
      key: 'audio-stream0',
      audioStream: {
        channelLayout: ['fl', 'fr'],
        mapping: [],
        codec: 'aac',
        bitrateBps: 64000,
        channelCount: 2,
        sampleRateHertz: 48000
      }
    }
  ],
  muxStreams: [
    {
      key: 'hd',
      container: 'mp4',
      elementaryStreams: ['video-stream1', 'audio-stream0']
    }
  ],
  overlays: [
    {
      image: {
        uri: overlayImageUri,
        resolution: {
          x: 0.1,
          y: 0.1
        },
        alpha: 1.0
      },
      animations: [
        {
          animationStatic: {
            xy: {
              x: 0.9,
              y: 0.9
            },
            startTimeOffset: {
              seconds: 0
            }
          }
        }
      ]
    }
  ]
};

const transcoderConfigWithoutAudio = {
  elementaryStreams: [
    {
      key: 'video-stream1',
      videoStream: {
        h264: {
          heightPixels: 720,
          widthPixels: 1280,
          bitrateBps: 2500000,
          frameRate: 30,
          profile: 'high',
          tune: '',
          preset: 'veryfast',
          pixelFormat: 'yuv420p',
          rateControlMode: 'vbr',
          enableTwoPass: false,
          crfLevel: 21,
          vbvSizeBits: 2500000,
          vbvFullnessBits: 2250000,
          allowOpenGop: false,
          entropyCoder: 'cabac',
          bPyramid: false,
          bFrameCount: 3,
          aqStrength: 1
        }
      }
    }
  ],
  muxStreams: [
    {
      key: 'hd',
      container: 'mp4',
      elementaryStreams: ['video-stream1']
    }
  ],
  overlays: [
    {
      image: {
        uri: overlayImageUri,
        resolution: {
          x: 0.1,
          y: 0.1
        },
        alpha: 1.0
      },
      animations: [
        {
          animationStatic: {
            xy: {
              x: 0.9,
              y: 0.9
            },
            startTimeOffset: {
              seconds: 0
            }
          }
        }
      ]
    }
  ]
};

type CheckExplicitContentsProps = {
  location: string;
  processingQueueUid: string;
  sectionUid: string;
};

const checkExplicitContents = async ({ location, processingQueueUid, sectionUid }: CheckExplicitContentsProps) => {
  const request = {
    inputUri: `${location}hd.mp4`,
    features: ['EXPLICIT_CONTENT_DETECTION']
  };

  // Human-readable likelihoods
  const likelihoods = ['UNKNOWN', 'VERY_UNLIKELY', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'VERY_LIKELY'];

  // Detects unsafe content
  const [operation] = await videoIntelligenceClient.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();
  // Gets unsafe content
  const explicitContentResults = operationResult.annotationResults[0].explicitAnnotation;

  const explicitFrames: { time: string; likelihood: string }[] = [];

  explicitContentResults.frames.forEach((result) => {
    if (
      likelihoods[result.pornographyLikelihood] === 'LIKELY' ||
      likelihoods[result.pornographyLikelihood] === 'VERY_LIKELY'
    ) {
      if (result.timeOffset === undefined) {
        result.timeOffset = {};
      }
      if (result.timeOffset.seconds === undefined) {
        result.timeOffset.seconds = 0;
      }
      if (result.timeOffset.nanos === undefined) {
        result.timeOffset.nanos = 0;
      }

      explicitFrames.push({
        time: `${result.timeOffset.seconds}` + `.${(result.timeOffset.nanos / 1e6).toFixed(0)}`,
        likelihood: likelihoods[result.pornographyLikelihood]
      });
    }
  });

  if (explicitFrames.length) {
    // Explicit detected
    // update processing queue
    console.log('Explicit results found');
    await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
      { uid: processingQueueUid },
      {
        $set: {
          intelligenceStatus: 'FAILED',
          failedFrames: explicitFrames,
          updated: Date.now()
        }
      }
    );
  } else {
    // safe video
    // update processing queue
    console.log('Video safe');
    await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
      { uid: processingQueueUid },
      {
        $set: {
          intelligenceStatus: 'COMPLETED',
          updated: Date.now()
        }
      }
    );

    const pageContent = await mongooseDb.connection
      .collection('pages')
      .findOne({ 'contentDraftSections.uid': sectionUid });

    const contentSections = pageContent?.contentDraftSections.map((section) =>
      section.uid === sectionUid ? { ...section, content: { ...section.content, processing: false } } : section
    );

    await mongooseDb.connection
      .collection('pages')
      .findOneAndUpdate({ uid: pageContent?.uid }, { $set: { contentDraftSections: contentSections } });
  }
};

type Payload = {
  fileName: string;
  tempFileName: string;
  pageUid: string;
  sectionUid: string;
  finalDestination: string;
  finalUrl: string;
};

/**
 * @api {post} /process-video Upload Video
 * @apiName uploadVideo
 * @apiGroup Files
 *
 * @apiParamExample {json} Request-Example:
 * {
 *
 * }
 */
export const processVideo = async (req: Request, res: Response) => {
  const { fileName, tempFileName, pageUid, sectionUid, finalDestination, finalUrl } = req.body as Payload;

  const bucket = storage.bucket(Config.cloudStorage);
  const tempFile = bucket.file(tempFileName);

  // Notify user in the UI when they receive this response
  res.json({ processing: true });

  // add to process queue
  const processingQueueUid = createUid();

  try {
    // status can be 'PROGRESS', 'FAILED', 'COMPLETED', 'REJECTED'
    await mongooseDb.connection.db.collection('video.processing.queue').insertOne({
      uid: processingQueueUid,
      fileName,
      tempFileName,
      pageUid,
      sectionUid,
      finalDestination,
      finalUrl,
      transcoderStatus: 'PROGRESS',
      transcoderJobId: '',
      intelligenceStatus: 'PROGRESS',
      failedFrames: [],
      isDeleted: false,
      created: Date.now()
    });

    // use transcoder here
    const tempFileMeta = await tempFile.getMetadata();
    const cloudFile = bucket.file(finalDestination);
    const cloudFileMeta = await cloudFile.getMetadata();

    const inputLocation = `gs://${tempFileMeta[0].bucket}/${tempFileMeta[0].name}`;
    const outputLocation = `gs://${cloudFileMeta[0].bucket}/page-${pageUid}/section-${sectionUid}/video-${fileName}/`;

    const transcoderServiceClient = new TranscoderServiceClient();

    const transcoderRequest = {
      parent: transcoderServiceClient.locationPath(getProjectId(), Config.projectLocation),
      job: {
        inputUri: inputLocation,
        outputUri: outputLocation,
        config: transcoderConfigWithAudio
      }
    };

    const createTranscoderJob = async (omitAudio?: boolean) => {
      let response: { name: string };
      let jobId: string;
      if (omitAudio) {
        const updatedRequest = {
          parent: transcoderServiceClient.locationPath(getProjectId(), Config.projectLocation),
          job: {
            inputUri: inputLocation,
            outputUri: outputLocation,
            config: transcoderConfigWithoutAudio
          }
        };

        [response] = await transcoderServiceClient.createJob(updatedRequest);
        logger.info(`Job sent to transcoder for ${tempFileName}: ${response.name}`);

        jobId = response.name.split('jobs/')[1];
      } else {
        [response] = await transcoderServiceClient.createJob(transcoderRequest);
        logger.info(`Job sent to transcoder for ${tempFileName}: ${response.name}`);

        jobId = response.name.split('jobs/')[1];
      }

      // update the db with jobId
      await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
        { uid: processingQueueUid },
        {
          $set: {
            transcoderJobId: jobId,
            updated: Date.now()
          }
        }
      );

      try {
        return await new Promise(async (resolve, reject) => {
          const checkStatus = async () => {
            const request = {
              name: transcoderServiceClient.jobPath(getProjectId(), Config.projectLocation, jobId)
            };
            const [jobResponse] = await transcoderServiceClient.getJob(request);

            if (jobResponse.state === 'SUCCEEDED') {
              clearInterval(interval);
              // update processing queue
              await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
                { uid: processingQueueUid },
                {
                  $set: {
                    transcoderStatus: 'COMPLETED',
                    updated: Date.now()
                  }
                }
              );
              resolve('');
            }

            if (jobResponse.state === 'FAILED') {
              clearInterval(interval);

              if (
                jobResponse.failureReason ===
                'Job validation failed: atom atom0 does not have any inputs (input0) with an audio track'
              ) {
                logger.info('Uploading video without audio.');
                // recursive function to run for videos without audio
                await createTranscoderJob(true);
                return resolve('');
              }
              // update processing queue
              await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
                { uid: processingQueueUid },
                {
                  $set: {
                    transcoderStatus: 'FAILED',
                    updated: Date.now()
                  }
                }
              );
              reject('Error');
            }
          };

          const interval = setInterval(checkStatus, 10000);
          await checkStatus();
        });
      } catch (error) {
        // update processing queue
        await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
          { uid: processingQueueUid },
          {
            $set: {
              transcoderStatus: 'FAILED',
              updated: Date.now()
            }
          }
        );
        logError('Error occurred while transcoding', error as Error);
        throw new RouteError('transcoder-processing-failed', 'Transcoder video processing failed.');
      }
    };

    await createTranscoderJob();

    // Make it public again cause of second upload.
    await cloudFile.makePublic();

    try {
      await checkExplicitContents({
        location: outputLocation,
        processingQueueUid,
        sectionUid
      });
    } catch (error) {
      logError('Error while explicit check ', error as Error);
    }
  } catch (e) {
    logError('Error in transcoder processsing ', e as Error);

    // update processing queue
    await mongooseDb.connection.db.collection('video.processing.queue').updateOne(
      { uid: processingQueueUid },
      {
        $set: {
          transcoderStatus: 'FAILED',
          updated: Date.now()
        }
      }
    );
  } finally {
    await tempFile.delete();
  }
};
