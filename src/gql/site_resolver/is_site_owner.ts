import { ApolloError } from "apollo-server-errors";
import { fetchSite } from "./fetch_site";

export const isSiteOwner = async (siteUid: string, userUid: string) => {
    const site = await fetchSite(siteUid)

    if (site.siteOwnersUids.filter((uid) => userUid).length === 0) {
        throw new ApolloError('not-site-owner', 'The user is not a site owner.')
    }

    return true;
}
