import { ContentSection, ContentTypes } from "../../models/content_section"
import { User } from "../../models/user_model"
import { isSiteOwner } from "../site_resolver/is_site_owner"
import { fetchPage } from "./fetch_page"
import { updateContent } from "./update_content"

export const pageSectionUpdate = async (user: User, pageUid: string, data: any): Promise<ContentSection<ContentTypes>> => {
    const page = await fetchPage(pageUid)
    await isSiteOwner(page.siteUid, user.uid)
    return await updateContent({
        ...data
    })
}