import { ApolloError } from "apollo-server-errors"
import { createUid } from "../../helpers/helpers"
import { MediaLink } from "../../models/media_link"
import { Site, SiteModel } from "../../models/site_model"
import { User } from "../../models/user_model"
import { isSiteUrlUnique } from "./is_site_url_unique"

export const createSite = async (props: {
    user: User,
    name: string,
    siteIcon: MediaLink,
    url: string,
    description?: string,
    siteColor?: string,
}): Promise<Site> => {
    const { user, name, siteIcon, url, description, siteColor } = props
    if (user.isFlagged) {
        throw new ApolloError('user-is-flagged', 'The user has been flagged. They cannot create sites.')
    }
    // Check the url is unique
    if (!(await isSiteUrlUnique(url))) {
        throw new ApolloError('site-url-not-unique', 'The page url was not unique.')
    }
    const site: Site = {
        uid: createUid(),
        name,
        description: description ?? '',
        siteIcon,
        url,
        siteColor,
        lastSiteUpdatedIso: new Date().toISOString(),
        createdIso: new Date().toISOString(),
        siteOwnersUids: [user.uid],
        totalEarnings: 0,
        totalVisits: 0,
        totalImpressions: 0,
        isBanned: false,
        isDeleted: false,
    }
    await SiteModel.create(site)

    return site
}