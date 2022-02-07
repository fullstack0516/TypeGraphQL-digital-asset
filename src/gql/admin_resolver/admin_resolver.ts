import { Arg, Authorized, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Site } from "../../models/site_model";
import { User } from "../../models/user_model";
import { Video, VIDEO_STATUS } from "../../models/video_model";
import { Page } from "../../models/page_model";
import { fetchFlaggedPages } from "./fetch_flagged_pages";
import { fetchUsers } from "./fetch_users";
import { countOfUsers } from "./count_of_users";
import { countOfNewUsers } from "./count_of_new_users";
import { fetchNewUsers } from "./fetch_new_users";
import { countOfNewSites } from "./count_of_new_sites";
import { fetchSites } from "./fetch_sites";
import { fetchNewPages } from "./fetch_new_pages";
import { countOfDataPoints } from "./count_of_data_points";
import { updatePage } from "../page_resolver/update_page";
import { MustBeLoggedIn } from "./requires_login";
import { PageResult, PagesResult } from "../page_resolver/page_resolver";
import { fetchVideos } from "./fetch_videos";
import { fetchVideo } from "./fetch_video";
import { updateVideoStatus } from "./updateVideoStatus";

/**
 * CRUD Operation on the site.
 */
@Resolver()
export class AdminResolver {
    constructor() { }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => PagesResult, {
        description: 'Fetches the flagged pages. Flagged pages are pages reported by users and new review.',
    })
    async adminFetchFlaggedPages(
        @Arg('fromIso') fromIso: string,
    ) {
        const pages = await fetchFlaggedPages(fromIso)
        return { pages }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchUsersResult, {
        description: 'Fetches new users',
    })
    async adminFetchUsers(
        @Arg('pageNum') pageNum: number,
        @Arg('showCount') showCount: number,
    ) {
        return await fetchUsers(pageNum, showCount);
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => CountResult, {
        description: 'Fetches count of the users',
    })
    async adminFetchUsersCount() {
        const count = await countOfUsers();
        return { count }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchNewUsersCountResult, {
        description: 'Fetches count of the new users. Can speifcy the days ago',
    })
    async adminFetchNewUsersCount(
        @Arg('daysNAgo') daysNAgo: number,
    ) {
        const { rate, count } = await countOfNewUsers(daysNAgo);
        return { rate, count }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => UsersResult, {
        description: 'Fetches new users',
    })
    async adminFetchNewUsers(
        @Arg('fromIso') fromIso: string,
    ) {
        const users = await fetchNewUsers(fromIso);
        return { users }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchNewUsersCountResult, {
        description: 'Fetches count of the new sites',
    })
    async adminFetchNewSitesCount(
        @Arg('daysNAgo') daysNAgo: number,
    ) {
        const { rate, count } = await countOfNewSites(daysNAgo);
        return { rate, count }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchSitesResult, {
        description: 'Fetches new sites in order of created.',
    })
    async adminFetchSites(
        @Arg('pageNum') pageNum: number,
        @Arg('showCount') showCount: number,
    ) {
        const { totalCount, sites } = await fetchSites(pageNum, showCount);
        return { totalCount, sites }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchPagesResult, {
        description: 'Fetchs new pages that have been created. Not updated.',
    })
    async adminFetchNewPages(
        @Arg('pageNum') pageNum: number,
        @Arg('showCount') showCount: number,
    ) {
        const { totalCount, pages } = await fetchNewPages(pageNum, showCount);
        return { totalCount, pages }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => CountResult, {
        description: 'Fetches the total number of data-points, app wide',
    })
    async adminFetchDataPointsCount() {
        const count = await countOfDataPoints();
        return { count }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Mutation((returns) => PageResult, {
        description: 'Updates a page, super admins can update any page.',
    })
    async adminUpdatePage(
        @Arg('pageToUpdateUid') pageToUpdateUid: string,
        @Arg('isBanned', { nullable: true }) isBanned?: string,
    ) {
        const page = await updatePage(pageToUpdateUid, {
            isBanned
        })
        return { page }
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchVideosResult, {
        description: 'Fetches video processing queue',
    })
    async adminFetchVideos(
        @Arg('pageNum') pageNum: number,
        @Arg('showCount') showCount: number,
    ) {
        return await fetchVideos(pageNum, showCount);
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Query((returns) => AdminFetchVideoResult, {
        description: 'Fetches video processing queue item',
    })
    async adminFetchVideo(
        @Arg('uid') uid: string,
    ) {
        return await fetchVideo(uid);
    }

    @MustBeLoggedIn()
    @Authorized('ADMIN')
    @Mutation((returns) => AdminUpdateVideoResult, {
        description: 'Updates the video status.',
    })
    async adminUpdateVideo(
        @Arg('uid') uid: string,
        @Arg('intelligenceStatus') intelligenceStatus: VIDEO_STATUS,
    ) {
        const video = await updateVideoStatus(uid, {
            intelligenceStatus
        })
        return { video }
    }
}

@ObjectType()
class AdminFetchSitesResult {
    @Field()
    totalCount!: number
    @Field(() => [Site])
    sites!: [Site]
}

@ObjectType()
class AdminFetchUsersResult {
    @Field()
    totalCount!: number
    @Field(() => [User])
    users!: [User]
}

@ObjectType()
class AdminFetchVideosResult {
    @Field()
    totalCount!: number
    @Field(() => [Video])
    videos!: [Video]
}

@ObjectType()
class AdminFetchVideoResult {
    @Field(() => Video)
    video!: Video
}

@ObjectType()
class AdminFetchPagesResult {
    @Field()
    totalCount!: number
    @Field(() => [Page])
    pages!: [Page]
}

@ObjectType()
class AdminFetchNewUsersCountResult {
    @Field()
    rate!: number
    @Field()
    count!: number
}

@ObjectType({description: "Fetches a list of users."})
class UsersResult {
    @Field(() => [User])
    users!: [User]
}

@ObjectType()
export class CountResult {
    @Field()
    count!: number
}

@ObjectType()
export class AdminUpdateVideoResult {
    @Field()
    video!: Video
}
