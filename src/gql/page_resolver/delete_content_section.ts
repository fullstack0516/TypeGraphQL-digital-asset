import { fetchPage } from "./fetch_page";
import { updatePage } from "./update_page";
import { deleteContentSectionFiles } from "./delete_content_section_files";

export const deleteContentSection = async (pageUid: string, contentSectionUid: string, deletePublished: boolean) => {

    const page = await fetchPage(pageUid)

    let contentDraftSections = page.contentDraftSections;

    const deletedSection = contentDraftSections.filter(i => i.uid == contentSectionUid)[0];
    contentDraftSections = contentDraftSections.filter(i => i.uid != contentSectionUid);

    await updatePage(page.uid, { contentDraftSections })

    // If the content is published; don't delete the file.
    if (!deletePublished) {
        if (page.contentSections.find((cs) => cs?.uid === contentSectionUid)) {
            return;
        }
    }

    await deleteContentSectionFiles(deletedSection)
}
