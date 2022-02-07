import { User } from '../../models/user_model';
import { ApolloError } from 'apollo-server-errors';
import { createUid, markdownToHtml } from '../../helpers/helpers';
import { Comment, CommentModel } from '../../models/comment_model';
import { createUserLight } from '../user_resolver/create_user_light';
import { PageModel } from '../../models/page_model';

export const createComment = async (props: {
    pageUid: string,
    user: User,
    content: string,
    parentUid?: string,
}): Promise<Comment> => {
    const { pageUid, content, user, parentUid } = props
    if (user.isFlagged) {
        throw new ApolloError('user-is-flagged', 'The user has been flagged. They cannot create pages.')
    }

    let page = (await PageModel.findOne({ uid: pageUid }).exec())?.toObject()
    if (!page) {
        throw new ApolloError('no-page', 'No page exists.')
    }

    const comment: Comment = {
        uid: createUid(),
        lastUpdateIso: new Date().toISOString(),
        createdIso: new Date().toISOString(),
        isBanned: false,
        isDeleted: false,
        isFlagged: false,
        numberOfReports: 0,
        count: 0,
        likes: 0,
        dislikes: 0,
        pageUid,
        author: createUserLight(user),
        content: {
            markdown: content,
            html: markdownToHtml(content),
        },
        parent: parentUid ?? '',
    }

    await CommentModel.create(comment)

    if (parentUid) {
        await CommentModel.updateOne(
            {
                uid: parentUid
            },
            {
                $inc: {
                    count: 1,
                }
            }
        )
    }

    return comment
}
