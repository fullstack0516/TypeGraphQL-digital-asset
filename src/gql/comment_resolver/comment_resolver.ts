import 'reflect-metadata'
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Comment, CommentModel } from '../../models/comment_model'
import { User } from '../../models/user_model'
import { MustBeLoggedIn } from '../admin_resolver/requires_login'
import RateLimit from '../rate-limiter'
import { createComment as createCommentF } from './create_comment'
import { deleteComment as deleteCommentF } from './delete_comment'
import { dislikeComment as dislikeCommentF } from './dislike-comment'
import { fetchComment } from './fetch_comment'
import { fetchComments as fetchCommentsF } from './fetch_comments'
import { likeComment as likeCommentF } from './like_comment'

@Resolver()
export class CommentResolver {
    constructor() { }

    @Mutation(() => Comment, {
        description: 'Creates a comment for the user.',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 5, numberOfRequests: 1 })
    async createComment(
        @Arg('pageUid') pageUid: string,
        @Arg('content') content: string,
        @Ctx('user') user: User,
        @Arg('parentUid', { nullable: true }) parentUid?: string,
    ) {
        return await createCommentF({ pageUid, content, user, parentUid })
    }

    @Mutation(() => Comment, {
        description: 'Delete a comment.',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async deleteComment(
        @Ctx('user') user: User,
        @Arg('commentUid') commentUid: string,
    ) {
        return await deleteCommentF(commentUid, user)
    }

    @Query(() => [Comment], { description: 'Fetch comments. Sorted by created.' })
    async fetchComments(
        @Arg('pageUid') pageUid: string,
        @Arg('fromIso', { nullable: true }) fromIso?: string,
        @Arg('parentUid', { nullable: true }) parentUid?: string,
        @Ctx('user') user?: User,
    ) {
        return await fetchCommentsF({
            pageUid,
            parentUid,
            fromIso,
            userUid: user?.uid
        })
    }

    @Query(() => Number, { description: 'Fetch total count of comments' })
    async fetchCountOfComments(
        @Arg('pageUid') pageUid: string
    ) {
        return await CommentModel.find({ pageUid, parent: '' }).count()
    }


    @Mutation(() => Comment, {
        description: 'Record the comment like.',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async likeComment(
        @Arg('commentUid') commentUid: string,
        @Ctx('user') user: User,
    ) {
        await likeCommentF(commentUid, user.uid)

        return await fetchComment(commentUid)
    }

    @Mutation(() => Comment, {
        description: 'Record the comment dislike.',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async disLikeComment(
        @Arg('commentUid') commentUid: string,
        @Ctx('user') user: User,
    ) {
        await dislikeCommentF(commentUid, user.uid)

        return await fetchComment(commentUid)
    }
}
