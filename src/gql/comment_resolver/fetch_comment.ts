import { ApolloError } from "apollo-server-errors"
import { Comment, CommentModel } from "../../models/comment_model"
/**
 * Returns undefined if there's no comment.
 */
export const fetchComment = async (uid: string): Promise<Comment> => {
    let comment = (await CommentModel.findOne({ uid }).exec())?.toObject()
    if (!comment) {
        throw new ApolloError('no-comment', 'No comment exists.')
    }
    // @ts-ignore
    delete comment._id

    return comment;
}
