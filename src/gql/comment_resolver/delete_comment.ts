import { ApolloError } from 'apollo-server-errors';
import { Comment, CommentModel } from '../../models/comment_model';
import { fetchComment } from './fetch_comment';

export const deleteComment = async (uid, user): Promise<Comment> => {
    if (user.isFlagged) {
        throw new ApolloError('user-is-flagged', 'The user has been flagged. They cannot create pages.')
    }

    await fetchComment(uid)

    await CommentModel.updateOne(
        {
            uid
        },
        {
            isDeleted: true
        }
    )

    return await fetchComment(uid)
}
