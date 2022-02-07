import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { fetchSite } from "./fetch_site";
import { updateSite } from "./update_site";
import { randomDummyProfilePhoto } from "../../helpers/helpers_photos";
import { asyncForEach, createUid } from "../../helpers/helpers";
import { Page, PageModel } from "../../models/page_model";
import { deletePage } from "../page_resolver/delete_page";
import { deleteFileViaUrl } from "../../helpers/helper_storage";
/**
 * Deletes all the sensative content
 */
export const deleteSite = async (uid: string) => {

    const siteName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '_',
        length: 1,
        style: 'lowerCase',
    });

    const site = await fetchSite(uid)
    await deleteFileViaUrl(site.siteIcon.url)

    // Delete the sensative info.
    await updateSite(uid, {
        name: 'deleted-' + siteName,
        siteIcon: randomDummyProfilePhoto(),
        description: '',
        url: 'deleted-' + createUid(),
        totalVisits: 0,
        totalEarnings: 0,
        siteOwnersUids: [],
        isDeleted: true,
    })

    // Delete pages
    const pagesToDelete = await PageModel.find({ siteUid: uid })
    await asyncForEach(pagesToDelete, async (page) => {
        await deletePage((page as Page).uid)
    })
}
