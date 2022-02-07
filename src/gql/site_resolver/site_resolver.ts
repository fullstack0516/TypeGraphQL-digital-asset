import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Site } from '../../models/site_model'
import { User } from '../../models/user_model'
import { fetchUserSites } from './fetch_user_sites'
import { fetchSiteViaUrl as fetchSiteViaUrlF } from './fetch_site_via_url'
import { fetchSite as fetchSiteF } from './fetch_site'
import { MediaLinkInputType } from "../../models/media_link";
import { updateSite as updateSiteF } from "./update_site";
import { isSiteOwner } from "./is_site_owner";
import { deleteSite as deleteSiteF } from "./delete_site";
import { fetchPopularSites } from "./fetch_popular_sites";
import RateLimit from '../rate-limiter'
import { isSiteUrlUnique } from "./is_site_url_unique";
import { createSite as createSiteF } from "./create_site";
import { MustBeLoggedIn } from "../admin_resolver/requires_login";

/**
 * CRUD Operation on the site.
 */
@Resolver(Site)
export class SiteResolver {
    constructor() { }

    @Query((returns) => ListOfSites, {
        description: 'Fetches the users sites.',
    })
    @MustBeLoggedIn()
    async fetchMySites(
        @Arg('fromIso') fromIso: string,
        @Ctx('user') user: User
    ) {
        const sites = await fetchUserSites(user.uid, fromIso);
        return { sites };
    }

    @Query((returns) => SiteResult, {
        description: 'Fetches site using site uid.',
    })
    async fetchSite(
        @Arg('siteUid') siteUid: string,
    ) {
        const site = await fetchSiteF(siteUid)
        return { site };
    }

    @Query((returns) => SiteResult, {
        description: 'Fetches site using site url.',
    })
    async fetchSiteViaUrl(
        @Arg('siteUrl') siteUrl: string,
    ) {
        const site = await fetchSiteViaUrlF(siteUrl);
        return { site };
    }

    @Mutation((returns) => CheckSiteUrlUniqueResult, {
        description: 'Check that the site URL is unique.',
    })
    async checkSiteUrlUnique(
        @Arg('url') url: string,
    ) {
        return { isUnique: (await isSiteUrlUnique(url)) }
    }

    @Mutation((returns) => SiteResult, {
        description: 'Creates a site for the user.',
    })
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async createSite(
        @Arg('name') name: string,
        @Arg('siteIcon') siteIcon: MediaLinkInputType,
        @Arg('url') url: string,
        @Ctx('user') user: User,
        @Arg('description', { nullable: true }) description?: string,
        @Arg('siteColor', { nullable: true }) siteColor?: string,
    ) {
        const site = await createSiteF({
            user,
            siteColor,
            siteIcon,
            description,
            url,
            name
        })

        return { site }
    }

    @Mutation((returns) => SiteResult, {
        description: 'Updates the base site settings. User must be site owner.',
    })
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async updateSite(
        @Arg('siteToUpdateUid') siteToUpdateUid: string,
        @Ctx('user') user: User,
        @Arg('name', { nullable: true }) name?: string,
        @Arg('siteIcon', { nullable: true }) siteIcon?: MediaLinkInputType,
        @Arg('description', { nullable: true }) description?: string,
    ) {
        await isSiteOwner(siteToUpdateUid, user.uid)
        const site = await updateSiteF(siteToUpdateUid, {
            name,
            description,
            siteIcon,
        })
        return { site }
    }

    @Mutation(() => String, { description: 'Delete a site for the user.' })
    @MustBeLoggedIn()
    @RateLimit({ timeWindowMinutes: 1, numberOfRequests: 10 })
    async deleteSite(
        @Arg('siteToDeleteUid') siteToDeleteUid: string,
        @Ctx('user') user: User
    ) {
        await isSiteOwner(siteToDeleteUid, user.uid)
        await deleteSiteF(siteToDeleteUid)
        return 'success'
    }

    @Query((returns) => ListOfSites, { description: 'Fetch the most popular sites.' })
    async discoverFetchPopularSites(
        @Arg('totalVisits') totalVisits: number,
    ) {
        const sites = await fetchPopularSites(totalVisits)
        return { sites }
    }
}

@ObjectType({ description: "Gets the site data." })
class SiteResult {
    @Field()
    site!: Site
}

@ObjectType({ description: 'Is the site url unique.' })
class CheckSiteUrlUniqueResult {
    @Field()
    isUnique!: boolean
}

@ObjectType({ description: 'The site data as an array' })
export class ListOfSites {
    @Field(type => [Site])
    sites!: Site[]
}
