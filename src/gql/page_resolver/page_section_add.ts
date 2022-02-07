import { ApolloError } from "apollo-server-errors";
import { ContentSection, ContentSectionTypes, ContentTypes } from "../../models/content_section";
import { User } from "../../models/user_model";
import { isSiteOwner } from "../site_resolver/is_site_owner";
import { fetchPage } from "./fetch_page";
import { makeContentSection } from "./make_content_section";
import { updatePage } from "./update_page";

export const pageSectionAdd = async (props: {
    user: User,
    pageUid: string,
    contentSectionType: ContentSectionTypes,
    index?: number
}): Promise<ContentSection<ContentTypes>> => {

    const { user, pageUid, contentSectionType, index } = props
    const page = await fetchPage(pageUid)
    await isSiteOwner(page.siteUid, user.uid)

    const contentDraftSections = page.contentDraftSections;
    if (contentSectionType === 'header' && contentDraftSections.find(contentSection => contentSection.type === 'header')) {
        throw new ApolloError('header-section-exist', 'Content header section already exists')
    }

    const newContentSection = makeContentSection(contentSectionType);

    if (index !== undefined) {
        contentDraftSections.splice(index, 0, newContentSection);
    }
    else {
        contentDraftSections.push(newContentSection);
    }
    await updatePage(page.uid, { contentDraftSections })

    return newContentSection
}
