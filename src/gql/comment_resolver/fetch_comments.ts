import { commentLikeCollectionName } from '../../models/comment_like'
import { Comment, CommentModel } from '../../models/comment_model'

export const fetchComments = async (props: {
    pageUid: string,
    parentUid?: string,
    fromIso?: string,
    userUid?: string,
}): Promise<Comment[]> => {
    const { pageUid, parentUid, fromIso, userUid } = props
    let query: any = {
        pageUid,
        parent: '',
        isBanned: false,
        isFlagged: false,
    }

    if (parentUid) {
        query.parent = parentUid
    }

    if (fromIso) {
        query.createdIso = { $gt: fromIso }
    }

    let userLikedQuery: any = []
    if (userUid) {
        userLikedQuery = [
            {
                $lookup: {
                    from: commentLikeCollectionName,
                    let: { commentUid: '$uid' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$$commentUid', '$commentUid'] },
                                userUid: userUid,
                            }
                        }
                    ],
                    as: '_userLikes'
                }
            },
            {
                $unwind: {
                    path: "$_userLikes",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    userLiked: "$_userLikes.liked"
                }
            },
            {
                $project: {
                    _userLikes: 0
                }
            },
        ]
    }

    const comments = await CommentModel.aggregate([
        {
            $match: query
        },
        ...userLikedQuery,
        {
            $sort: { createdIso: 1 }
        },
        {
            $limit: 3
        }
    ])

    return comments
}
