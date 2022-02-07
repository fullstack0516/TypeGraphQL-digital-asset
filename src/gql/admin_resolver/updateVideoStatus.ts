import { Video, VideoModel, VIDEO_STATUS } from '../../models/video_model';
import { fetchVideo } from './fetch_video';
import { mongooseDb } from '../../helpers/mongodb';
import * as gcs from '@google-cloud/storage';
import { Config } from '../../helpers/config';

const storage = new gcs.Storage();

/**
 * Updates the page
 */
export const updateVideoStatus = async (
  uid: string,
  { intelligenceStatus }: { intelligenceStatus: VIDEO_STATUS }
): Promise<Video> => {
  const updated = Date.now();

  const isDeleted = intelligenceStatus === 'REJECTED';

  await VideoModel.updateOne(
    { uid },
    {
      $set: { intelligenceStatus, updated, isDeleted }
    }
  );

  const { video } = await fetchVideo(uid);

  const pageContent = await mongooseDb.connection
    .collection('pages')
    .findOne({ 'contentDraftSections.uid': video.sectionUid });

  if (intelligenceStatus === 'REJECTED') {
    // delete the video file and video from the section
    const bucket = storage.bucket(Config.cloudStorage);
    const videoFile = bucket.file(video.finalDestination as string);
    await videoFile.delete();

    const contentSections = pageContent?.contentDraftSections.filter((section) => section.uid != video.sectionUid);

    await mongooseDb.connection
      .collection('pages')
      .findOneAndUpdate({ uid: pageContent?.uid }, { $set: { contentDraftSections: contentSections } });

    // TODO: send notification that video is deleted
  }

  if (intelligenceStatus === 'COMPLETED') {
    // update processing status to false
    const contentSections = pageContent?.contentDraftSections.map((section) =>
      section.uid === video.sectionUid ? { ...section, content: { ...section.content, processing: false } } : section
    );

    await mongooseDb.connection
      .collection('pages')
      .findOneAndUpdate({ uid: pageContent?.uid }, { $set: { contentDraftSections: contentSections } });

    // TODO: send notification that video is approved
  }

  return video;
};
