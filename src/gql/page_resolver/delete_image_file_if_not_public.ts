import { fetchPage } from "./fetch_page";
import { deleteFileViaUrl } from "../../helpers/helper_storage";

/**
 * Deleting draft images should not delete public images.
 */
export const deleteImageFileIfNotPublic = async (pageUid: string, url: string) => {
    const page = await fetchPage(pageUid)
    let isPublic = false;
    page.contentSections.forEach((cs) => {
        if (cs.type === 'triple-image-col') {
            (cs.content as any)?.images.forEach((img) => {
                if (img?.url === url) {
                    isPublic = true;
                }
            })
        }
        else {
            const publicUrl = (cs.content as any)?.image?.url;
            if (publicUrl && publicUrl === url) {
                isPublic = true;
            }
        }
    })
    if (!isPublic) {
        deleteFileViaUrl(url)
    }
}
