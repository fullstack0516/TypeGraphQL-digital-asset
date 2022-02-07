import { adjectives, animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import { fetchPage } from "./fetch_page";
import { asyncForEach } from "../../helpers/helpers";
import { updatePage } from "./update_page";
import { createUid } from "../../helpers/helpers";
import { deleteContentSectionFiles } from "./delete_content_section_files";
/**
 * Deletes all the sensative content
 */
export const deletePage = async (uid: string) => {

    const pageName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '_',
        length: 1,
        style: 'lowerCase',
    });

    const page = await fetchPage(uid)

    // Add them together since they share the same content urls, and same uids.
    const allSections = {}
    page.contentSections.forEach((p) => {
        allSections[p.uid] = p;
    })
    page.contentDraftSections.forEach((p) => {
        allSections[p.uid] = p;
    })
    await asyncForEach(Object.keys(allSections), async eachSectionKey => {
        await deleteContentSectionFiles(allSections[eachSectionKey])
    })

    // Delete the sensative info.
    await updatePage(uid, {
        title: 'deleted-' + pageName,
        description: '',
        url: 'deleted-' + createUid(),
        totalVisits: 0,
        totalEarnings: 0,
        isDeleted: true,
        dataTags: [],
        contentSections: [],
        contentDraftSections: [],
    })
}
