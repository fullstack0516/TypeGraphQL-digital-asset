import { ApolloError } from "apollo-server-errors"
import { User } from "../../models/user_model"
import { isSiteOwner } from "../site_resolver/is_site_owner"
import { fetchPage } from "./fetch_page"
import { publishPage } from "./publish_page"

export const pageSectionPublish = async (user: User, pageUid: string) => {
    if (user.isFlagged) {
        throw new ApolloError('user-is-flagged', 'The user has been flagged. They cannot publish content.')
    }

    const page = await fetchPage(pageUid)
    await isSiteOwner(page.siteUid, user.uid)
    await publishPage(pageUid)
}