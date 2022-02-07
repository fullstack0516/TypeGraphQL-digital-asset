import { Video, VideoModel } from '../../models/video_model';

export const fetchVideos = async (
  pageNum: number,
  showCount: number
): Promise<{ totalCount: number; videos: Video[] }> => {
  const pageNumber = pageNum ? pageNum : 0;
  const limit = showCount ? showCount : 10;

  const query1: any = {
    transcoderStatus: { $in: ['PROGRESS', 'FAILED'] },
    isDeleted: false
  };
  const query2: any = {
    intelligenceStatus: { $in: ['PROGRESS', 'FAILED'] },
    isDeleted: false
  };

  const query = { $or: [query1, query2] };

  const totalCount = await VideoModel.find(query).count();
  const videos = await VideoModel.find(query)
    .sort({ created: -1 })
    .skip(limit * (pageNumber - 1))
    .limit(limit);

  return { totalCount, videos };
};
