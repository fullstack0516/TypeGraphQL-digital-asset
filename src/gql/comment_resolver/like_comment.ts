import { createUid } from "../../helpers/helpers"
import { fetchComment } from "./fetch_comment"
import { CommentLike, CommentLikeModel } from "../../models/comment_like"
import { CommentModel } from "../../models/comment_model"

export const likeComment = async (commentUid: string, userUid: string) => {
    // Check comment exists.
    await fetchComment(commentUid)
    // check user voted before
    const existingLike = await CommentLikeModel.findOne({ commentUid: commentUid, userUid: userUid }).exec()

    const newLike: CommentLike = {
        uid: createUid(),
        createdIso: new Date().toISOString(),
        commentUid,
        userUid,
        liked: existingLike?.liked === 1 ? 0 : 1
    }

    if (existingLike) {
        // @ts-ignore
        delete newLike.uid;
        // update the liked
        await CommentLikeModel.updateOne(
            { uid: existingLike.uid },
            {
                $set: newLike
            }
        ).exec()
        // update the likes of page according to the value of old and new liked
        await CommentModel.updateOne(
            { uid: commentUid },
            {
                $inc: {
                    likes: existingLike.liked === 1 ? -1 : 1,
                    dislikes: existingLike.liked === -1 ? -1 : 0,
                },
            }
        ).exec()

        return;
    }

    // create the new liked
    await CommentLikeModel.create(newLike)
    // increase the likes of page
    await CommentModel.updateOne(
        { uid: commentUid }, {
        $inc: {
            likes: 1,
        }
    }).exec()
}
