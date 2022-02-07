import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import { User } from '../../models/user_model'
import RateLimit from '../rate-limiter'
import { createPage as createPageF } from './create_page'
import { Page } from '../../models/page_model'
import { isPageUrlUnique } from './is_page_url_unique'
import { ApolloError } from 'apollo-server-errors'
import { fetchPageViaUrl as fetchPageViaUrlF } from './fetch_page_via_url'
import { fetchNewPages } from './fetch_new_pages'
import { fetchPopularPages } from './fetch_popular_page'
import { fetchTrendingPages } from './fetch_trending_pages'
import { fetchPage } from './fetch_page'
import { isSiteOwner } from '../site_resolver/is_site_owner'
import { updatePage as updatePageF } from './update_page'
import { deletePage as deletePageF } from './delete_page'
import { ContentSection, ContentSectionTypes, ContentTypes } from '../../models/content_section'
import { deleteContentSection } from './delete_content_section'
import { fetchSitePages } from './fetch_site_pages'
import { subscribeUserToSite } from './subscribe_user_to_site'
import { unsubscribeUserToSite } from './unsubscribe_user_to_site'
import { recordImpression } from './record_impression'
import { recordVisit } from './record_visit'
import { reportPage as reportPageF } from './report_page'
import { fetchSiteViaUrl } from '../site_resolver/fetch_site_via_url'
import { Site } from '../../models/site_model'
import { updateHistory } from './update_history'
import { recordDataTagsForUser } from './record_data_tags_for_user'
import { discoverFetchNewPages as discoverFetchNewPagesF } from './discover_fetch_new_pages'
import { discoverFetchPopularPages as discoverFetchPopularPagesF } from './discover_fetch_popular_pages'
import { discoverFetchTrendingPages as discoverFetchTrendingPagesF } from './discover_fetch_trending_pages'
import { fetchHomePages } from './fetch_home_pages'
import { fetchSubscribedSitesNewPages } from './fetch_subscribed_sites_new_pages'
import { likePage } from './like_page'
import { pageSectionAdd as pageSectionAddF } from './page_section_add'
import { pageSectionPublish as pageSectionPublishF } from './page_section_publish'
import { pageSectionUpdate as pageSectionUpdateF } from './page_section_update'
import { MustBeLoggedIn } from '../admin_resolver/requires_login'
import { PageLike, PageLikeModel } from '../../models/page_like'
import { dislikePage } from './dislike-page'
import { addMetaTag as addMetaTagF } from './add_meta_tag'
import { removeMetaTag as removeMetaTagF } from './remove_meta_tag'

@Resolver(Page)
export class PageResolver {
    constructor() { }
    // create the page
    @Mutation((returns) => PageResult, {
        description: 'Creates a page for the user.',
    })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async createPage(
        @Arg('title', { validate: true }) title: string,
        @Arg('siteUid') siteUid: string,
        @Arg('url') url: string,
        @Ctx('user') user: User
    ) {
        const page = await createPageF({ title, siteUid, url, user })
        return { page }
    }

    @Mutation((returns) => CheckPageUrlUniqueResult, {
        description: 'Check that the page URL is unique',
    })
    async checkPageUrlUnique(
        @Arg('url') url: string,
    ) {
        return {
            isUnique: await isPageUrlUnique(url)
        }
    }

    @Query((returns) => FetchPageViaUrlResult, {
        description: 'Fetches page via the url name.',
    })
    @MustBeLoggedIn()
    async fetchPageViaUrl(
        @Arg('url') url: string,
    ) {
        const urls = url.split('/')
        if (urls.length !== 2) {
            throw new ApolloError('Invalid fields, url incorrect', 'The endpoint requires a page and site url, like some-site/some-page')
        }
        const page = await fetchPageViaUrlF(urls[0], urls[1])
        return {
            page,
            newPagesFromSite: (await fetchNewPages(page.siteUid)),
            popularPagesFromSite: (await fetchPopularPages(page.siteUid)),
            trendingPageFromSite: (await fetchTrendingPages(page.siteUid)),
        }
    }

    @Mutation((returns) => PageResult, {
        description: 'Updates the base page settings. User must be site owner.',
    })
    @MustBeLoggedIn()
    async updatePage(
        @Arg('pageToUpdateUid') pageToUpdateUid: string,
        @Ctx('user') user: User,
        @Arg('title', { nullable: true }) title?: string,
        @Arg('pageColor', { nullable: true }) pageColor?: string,
        @Arg('isPublished', { nullable: true }) isPublished?: boolean,
    ) {
        const pageToUpdate = await fetchPage(pageToUpdateUid)
        await isSiteOwner(pageToUpdate.siteUid, user.uid)
        const page = await updatePageF(pageToUpdateUid, {
            title,
            pageColor,
            isPublished
        })
        return { page }
    }

    @Mutation(() => PageResult, { description: 'Updates the page userMetaTags by adding one more tag' })
    @MustBeLoggedIn()
    async addMetaTag(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User,
        @Arg('newTagString') newTagString: string,
    ) {
        await addMetaTagF({
            pageUid: pageUid,
            newTagString,
            user
        })

        const page = await fetchPage(pageUid)
        return { page }
    }

    @Mutation(() => PageResult, { description: 'Updates the page userMetaTags by removing one more tag' })
    @MustBeLoggedIn()
    async removeMetaTag(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User,
        @Arg('metaTagUid') metaTagUid: string,
    ) {
        await removeMetaTagF({
            pageUid: pageUid,
            metaTagUid,
            user
        })

        const page = await fetchPage(pageUid)
        return { page }
    }

    @Mutation(() => String, { description: 'Deletes a page for the user.', })
    @MustBeLoggedIn()
    async deletePage(
        @Arg('pageToDeleteUid') pageToDeleteUid: string,
        @Ctx('user') user: User
    ) {
        const page = await fetchPage(pageToDeleteUid)
        await isSiteOwner(page.siteUid, user.uid)
        await deletePageF(pageToDeleteUid)

        return 'success'
    }

    @Mutation((returns) => PageSectionAddResult, {
        description: "Page add content block to the specific indexed position. If index doesn't exist, just add it at the end of the drafts."
    })
    @MustBeLoggedIn()
    async pageSectionAdd(
        @Arg('pageUid') pageUid: string,
        @Arg('contentSectionType') contentSectionType: ContentSectionTypes,
        @Ctx('user') user: User,
        @Arg('index', { nullable: true }) index?: number,
    ) {
        const newContentSection = await pageSectionAddF({
            user,
            pageUid,
            contentSectionType,
            index
        })
        return {
            page: (await fetchPage(pageUid)),
            contentSection: newContentSection,
        }
    }

    @Mutation((returns) => PageResult, {
        description: "Delete a section on the page."
    })
    @MustBeLoggedIn()
    async pageSectionDelete(
        @Arg('pageUid') pageUid: string,
        @Arg('contentSectionUid') contentSectionUid: string,
        @Ctx('user') user: User
    ) {
        const page = await fetchPage(pageUid)
        await isSiteOwner(page.siteUid, user.uid)
        await deleteContentSection(pageUid, contentSectionUid, false)
        return { page: (await fetchPage(page.uid)) }
    }

    @Mutation((returns) => PageSectionUpdateResult, {
        description: "Update a page content section."
    })
    @MustBeLoggedIn()
    async pageSectionUpdate(
        @Arg('pageUid') pageUid: string,
        @Arg('contentSectionUid') contentSectionUid: string,
        @Ctx('user') user: User,
        @Arg('newImageUrl', { nullable: true }) newImageUrl?: string,
        @Arg('newText', { nullable: true }) newText?: string,
        @Arg('newTitle', { nullable: true }) newTitle?: string,
        @Arg('processing', { nullable: true }) processing?: boolean,
        @Arg('newVideoUrl', { nullable: true }) newVideoUrl?: string,
        @Arg('deleteImage', { nullable: true, defaultValue: false }) deleteImage?: boolean,
        @Arg('deleteVideoUrl', { nullable: true, defaultValue: false }) deleteVideoUrl?: boolean,
        @Arg('nthImage', { nullable: true }) nthImage?: number,
    ) {
        const data = {
            pageUid,
            contentSectionUid,
            newImageUrl,
            newText,
            newTitle,
            processing,
            newVideoUrl,
            deleteImage,
            deleteVideoUrl,
            nthImage
        }
        const updatedSection = await pageSectionUpdateF(user, pageUid, data)

        return {
            page: (await fetchPage(pageUid)),
            updatedSection,
        }
    }

    @Mutation((returns) => PageResult, {
        description: "Publish the page and process the data tags."
    })
    @MustBeLoggedIn()
    async pageSectionPublish(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User
    ) {
        await pageSectionPublishF(user, pageUid)

        return {
            page: await fetchPage(pageUid)
        }
    }

    @Mutation((returns) => PageResult, {
        description: "Reorder the page content blocks by index."
    })
    @MustBeLoggedIn()
    async pageSectionsReorder(
        @Arg('pageUid') pageUid: string,
        @Arg('fromIndex') fromIndex: number,
        @Arg('toIndex') toIndex: number,
        @Ctx('user') user: User
    ) {
        const page = await fetchPage(pageUid);
        await isSiteOwner(page.siteUid, user.uid);
        let contentDraftSections = page.contentDraftSections;
        // in the reordered result, first section should be header
        if (
            (toIndex === 0 && contentDraftSections[fromIndex].type !== 'header') ||
            (fromIndex === 0 && contentDraftSections[toIndex].type !== 'header')
        ) {
            throw new ApolloError('first-not-header', 'First Section should be header content.');
        }
        // change the order of the sections
        const item = contentDraftSections.splice(fromIndex, 1)[0];
        contentDraftSections.splice(toIndex, 0, item);
        await updatePageF(page.uid, { contentDraftSections });
        return {
            page: (await fetchPage(pageUid))
        }
    }

    @Query(() => PagesResult, {
        description: "Fetch site pages recent updates"
    })
    async fetchSitePagesRecentUpdates(
        @Arg('siteUid') siteUid: string,
        @Arg('fromIso') fromIso: string,
    ) {
        const pages = await fetchSitePages(siteUid, fromIso)
        return { pages };
    }

    @Mutation(() => String, { description: "Subscribe to this site, get page updates." })
    @MustBeLoggedIn()
    async subscribeToSite(
        @Arg('siteUid') siteUid: string,
        @Ctx('user') user: User
    ) {
        await subscribeUserToSite(user.uid, siteUid)

        return 'success'
    }

    @Mutation(() => String, { description: "Subscribe to this site, get page updates." })
    @MustBeLoggedIn()
    async unsubscribeToSite(
        @Arg('siteUid') siteUid: string,
        @Ctx('user') user: User
    ) {
        await unsubscribeUserToSite(user.uid, siteUid)
        return 'success'
    }

    @Mutation(() => String, { description: "Record the site impression, impression isn't a visit; impression is when the site is seen with other sites, like 'top sites' on another page/site for example." })
    async recordPageImpression(
        @Arg('pageUid') pageUid: string,
    ) {
        await recordImpression(pageUid)

        return 'success'
    }

    @Mutation(() => String, { description: "Record the site visit." })
    async recordPageVisit(
        @Arg('pageUid') pageUid: string,
    ) {
        await recordVisit(pageUid)

        return 'success'
    }

    @Mutation(() => PageResult, { description: "Record the site like." })
    @MustBeLoggedIn()
    async recordPageLike(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User
    ) {
        await likePage(pageUid, user.uid)
        return {
            page: (await fetchPage(pageUid))
        }
    }

    @Mutation(() => PageResult, { description: "Record the site dislike." })
    @MustBeLoggedIn()
    async recordPageDislike(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User
    ) {
        await dislikePage(pageUid, user.uid)
        return {
            page: (await fetchPage(pageUid))
        }
    }

    @Mutation(() => String, { description: "Report the page. After X number of visits vs. reports the page is flagged automiatcally." })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async reportPage(
        @Arg('pageUid') pageUid: string,
        @Arg('reasonDesc') reasonDesc: string,
        @Ctx('user') user: User
    ) {
        await reportPageF(
            pageUid,
            user.uid,
            reasonDesc,
        );

        return 'success'
    }

    @Query(() => FetchPageLikeResult, { description: "Fetchs the pageLike related to user. Basically to check if they liked the page or not." })
    @MustBeLoggedIn()
    async fetchPageLike(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User,
    ) {
        const pageLike = await PageLikeModel.findOne({ pageUid: pageUid, userUid: user.uid }).exec()

        return {
            pageLike
        }
    }

    @Query(() => FetchPageViaUrlResult, { description: "Fetches the page for visitors." })
    async fetchPageViaUrlPublic(
        @Arg('url') url: string,
    ) {
        const urls = url.split('/')
        if (urls.length !== 2) {
            throw new ApolloError('Invalid fields, url incorrect', 'The endpoint requires a page and site url, like some-site/some-page')
        }
        const page = await fetchPageViaUrlF(urls[0], urls[1])
        // @ts-ignore
        delete page.contentDraftSections;

        return {
            page,
            newPagesFromSite: (await fetchNewPages(page.siteUid)),
            popularPagesFromSite: (await fetchPopularPages(page.siteUid)),
            trendingPageFromSite: (await fetchTrendingPages(page.siteUid)),
        }
    }

    @Query(() => FetchSiteResult, { description: "Fetches the page for visitors who are not logged in." })
    async fetchSiteViaUrlPublic(
        @Arg('siteUrl') siteUrl: string,
    ) {
        const site = await fetchSiteViaUrl(siteUrl)
        return {
            site,
            newPagesFromSite: (await fetchNewPages(site.uid)),
            popularPagesFromSite: (await fetchPopularPages(site.uid)),
            trendingPageFromSite: (await fetchTrendingPages(site.uid)),
        }
    }

    @Mutation(() => RecordPageTagsResult, { description: "Updates the users data-tags with the pages data-tags. So we can track their tags. Also adds the page to their history." })
    @MustBeLoggedIn()
    async recordPageTags(
        @Arg('pageUid') pageUid: string,
        @Ctx('user') user: User
    ) {
        const result = await updateHistory(pageUid, user.uid)
        // Record the data tags.
        if (result === 'createdNew' || result == 'pageChanged') {
            await recordDataTagsForUser(pageUid, user.uid)
        }
        return { result }
    }

    @Query(() => FetchTrendingPageResult, { description: "Fetch more trending pages. Trending pages are sorted by max days ago and visited." })
    async fetchMoreTrendingPages(
        @Arg('siteUid') siteUid: string,
        @Arg('totalVisits', { nullable: true }) totalVisits?: number,
    ) {
        return {
            trendingPageFromSite: (await fetchTrendingPages(siteUid, totalVisits)),
        }
    }

    @Query(() => FetchNewPages, { description: "Fetch more new pages from a date." })
    async fetchMoreNewPages(
        @Arg('siteUid') siteUid: string,
        @Arg('fromIso', { nullable: true }) fromIso?: string,
    ) {
        return { newPagesFromSite: (await fetchNewPages(siteUid, fromIso)), }
    }

    @Query(() => FetchPopularPageResult, { description: "Fetch popular pages, from a date. Popular is sorted by most visited." })
    async fetchMorePopularPages(
        @Arg('siteUid') siteUid: string,
        @Arg('totalVisits', { nullable: true }) totalVisits?: number,
    ) {
        return { popularPagesFromSite: (await fetchPopularPages(siteUid, totalVisits)), }
    }

    @Query(() => DiscoverFetchPopularPagesResult, { description: 'Fetch the most popular pages. Popular is sorted by most visited.' })
    async discoverFetchPopularPages(
        @Arg('itemNumber') itemNumber: number,
        @Arg('category', { nullable: true }) category?: string,
    ) {
        return await discoverFetchPopularPagesF(itemNumber, category)
    }

    @Query(() => PagesResult, { description: 'Fetch new pages N days ago. Sorted by created.' })
    async discoverFetchNewPages(
        @Arg('fromIso', { nullable: true }) fromIso?: string,
        @Arg('category', { nullable: true }) category?: string,
    ) {
        const pages = await discoverFetchNewPagesF(category, fromIso)
        return { pages }
    }

    @Query(() => DiscoverFetchPopularPagesResult, { description: 'Fetch new pages N days ago, sorted by most popular.' })
    async discoverFetchTrendingPages(
        @Arg('itemNumber') itemNumber: number,
        @Arg('category', { nullable: true }) category?: string,
    ) {
        return await discoverFetchTrendingPagesF(itemNumber, category)
    }

    @Query(() => DiscoverFetchPopularPagesResult, { description: 'Fetch the new pages ordered by most visited, n days ago.' })
    async discoverFetchHomePages(
        @Arg('itemNumber') itemNumber: number,
        @Arg('category', { nullable: true }) category?: string,
    ) {
        return await fetchHomePages(itemNumber, category)
    }

    @Query(() => PagesResult, { description: 'Fetches the users subscribed pages. Sorted by new.' })
    @MustBeLoggedIn()
    async discoverFetchSubscribedNewPages(
        @Ctx('user') user: User
    ) {
        const pages = await fetchSubscribedSitesNewPages(user.uid)
        return {
            pages
        }
    }
}

@ObjectType()
class FetchSiteResult {
    @Field()
    site!: Site
    @Field(() => [Page],)
    newPagesFromSite?: [Page]
    @Field(() => [Page],)
    popularPagesFromSite?: [Page]
    @Field(() => [Page],)
    trendingPageFromSite?: [Page]
}

@ObjectType()
class FetchPageViaUrlResult {
    @Field()
    page!: Page
    @Field(() => [Page],)
    newPagesFromSite?: [Page]
    @Field(() => [Page],)
    popularPagesFromSite?: [Page]
    @Field(() => [Page],)
    trendingPageFromSite?: [Page]
}

@ObjectType()
class FetchPageLikeResult {
    @Field({ nullable: true })
    pageLike?: PageLike
}

@ObjectType()
class PageSectionAddResult {
    @Field()
    page!: Page
    @Field()
    contentSection!: ContentSection<ContentTypes>
}

@ObjectType()
class PageSectionUpdateResult {
    @Field()
    page!: Page
    @Field()
    updatedSection!: ContentSection<ContentTypes>
}

@ObjectType()
class FetchTrendingPageResult {
    @Field(() => [Page],)
    trendingPageFromSite!: [Page]
}

@ObjectType({ description: 'Fetches a list of pages from a site.' })
class FetchNewPages {
    @Field(() => [Page],)
    newPagesFromSite!: [Page]
}

@ObjectType()
class FetchPopularPageResult {
    @Field(() => [Page],)
    popularPagesFromSite!: [Page]
}

@ObjectType()
class DiscoverFetchPopularPagesResult {
    @Field(() => [Page])
    pages!: [Page]
    @Field()
    itemNumber!: number
}

@ObjectType()
class CheckPageUrlUniqueResult {
    @Field()
    isUnique!: boolean
}

@ObjectType()
class RecordPageTagsResult {
    @Field()
    result!: string
}

@ObjectType()
export class PagesResult {
    @Field(() => [Page])
    pages!: [Page]
}

@ObjectType()
export class PageResult {
    @Field()
    page!: Page
}
