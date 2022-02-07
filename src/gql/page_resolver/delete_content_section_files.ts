import { ContentImageRow, ContentSection, ContentTextImageRight, ContentTextImageLeft } from "../../models/content_section"
import { deleteFileViaUrl } from "../../helpers/helper_storage"
import { logError } from "../../helpers/logger"
/**
 * Remove all files reguardless of if it's public or not
 */
export const deleteContentSectionFiles = async (contentSection: ContentSection<any>) => {
    try {
        if (contentSection.type == 'image-row') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentImageRow>).content.image.url)
        }
        if (contentSection.type == 'text-image-right') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentTextImageRight>).content.image.url)
        }
        if (contentSection.type == 'text-image-left') {
            await deleteFileViaUrl((contentSection as ContentSection<ContentTextImageLeft>).content.image.url)
        }
    } catch (e) {
        logError('Could not delete content section file. Might be shared with draft.', { e })
    }
}
