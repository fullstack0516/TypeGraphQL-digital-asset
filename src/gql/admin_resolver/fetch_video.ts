import { Video, VideoModel } from '../../models/video_model';

export const fetchVideo = async (
  uid: string,
): Promise<{ video: Video }> => {
  const query = { uid };

  const video = (await VideoModel.findOne(query)) as Video;

  return { video };
};
