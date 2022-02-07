import { fetchPage } from "./fetch_page";
import { updatePage } from "./update_page";
import { asyncForEach, createUid } from "../../helpers/helpers";
import { deleteImageFileIfNotPublic } from "./delete_image_file_if_not_public";
import language from '@google-cloud/language'
import { Page } from "../../models/page_model";
import { DataTag } from "../../models/data_tag";
import { ContentHeader, ContentSection, ContentTextBlock, ContentTextImageLeft, ContentTextImageRight } from "../../models/content_section";
import { logError, logWarning } from "../../helpers/logger";

export const publishPage = async (pageUid: string) => {
    let page = await fetchPage(pageUid)

    const oldLiveSections = page.contentSections;
    const draftSections = page.contentDraftSections;

    await updatePage(pageUid, { contentSections: draftSections, lastPublishIso: new Date().toISOString(), isPublished: true })

    page = await fetchPage(pageUid)
    const dataTags = await createPageDataTags(page);

    // Get the content categories if the exist from the datatags
    let contentCategories: string[] = []
    if (dataTags.length > 0) {
        contentCategories = dataTags[0].contentCategories
    }

    page = await fetchPage(pageUid)
    await updatePage(pageUid, { dataTags, contentCategories })

    // Find the live pages that are removed. Remove their file/image content.
    const removedSections = oldLiveSections.filter((oldLiveSection) => {
        if (draftSections.filter((draftSection) => draftSection.uid === oldLiveSection.uid).length === 1) {
            return false
        }
        return true;
    })

    // Remove files from the removed sections.
    await asyncForEach(removedSections, async removedSection => {
        const publicMediaLink = ((removedSection).content as any)?.image?.url
        if (publicMediaLink) {
            await deleteImageFileIfNotPublic(pageUid, publicMediaLink)
        }
    })
}

const languageServiceClient = new language.LanguageServiceClient();

export const createPageDataTags = async (page: Page): Promise<DataTag[]> => {

    try {

        let allHtml = ''

        page.contentSections.forEach((section) => {
            if (section.type == 'header') {
                allHtml += (section as ContentSection<ContentHeader>).content.text.html
            }
            if (section.type == 'text-block') {
                allHtml += (section as ContentSection<ContentTextBlock>).content.text.html
            }
            if (section.type == 'text-image-left') {
                allHtml += (section as ContentSection<ContentTextImageLeft>).content.text.html
            }
            if (section.type == 'text-image-right') {
                allHtml += (section as ContentSection<ContentTextImageRight>).content.text.html
            }
        })

        const document = {
            content: allHtml,
            // HTML = 2, PLAIN_TEXT = 1, 0, unspecifed.
            type: 2,
        };

        // Detects the category of the text.
        const [categoriesResults] = await languageServiceClient.classifyText({ document: document });

        // Get the content categories.
        const contentCategories: string[] = [];
        (categoriesResults.categories ?? []).forEach((category) => {
            if (category.name && category.confidence) {
                // Each tag can have multiple parts, such as:
                // Example: /Autos & Vehicles/Bicycles & Accessories
                // You can find more examples here // https://cloud.google.com/natural-language/docs/categories
                const categoryNames = category.name.split('/')
                categoryNames.forEach((eachCategoryName) => {
                    if (eachCategoryName) {
                        contentCategories.push(eachCategoryName)
                    }
                })
            }
        })

        if (contentCategories.length == 0) {
            logWarning('Page content had no categories. Url was: ' + page.url)
        }

        const tags: { [tagString: string]: DataTag } = {};

        // Detects the tags of the text
        const [entitiesResults] = await languageServiceClient.analyzeEntities({ document: document });

        (entitiesResults.entities ?? []).forEach((entity) => {
            if (entity.name && entity.salience && entity.salience > 0) {
                const name = entity.name;

                if (name && entity.type && !['OTHER', 'EVENT', 'NUMBER', 'WORK_OF_ART'].includes(entity.type as string)) {
                    let count = 1;
                    if (tags[name]) {
                        count = tags[name].count + 1;
                    }
                    tags[name] = {
                        uid: createUid(),
                        tagString: name,
                        tagCreatedIso: new Date().toISOString(),
                        contentCategories,
                        tagScore: entity.salience,
                        count,
                    }
                }
            }
        })

        return Object.values(tags)
    } catch (e: any) {
        logError("Create data tag error ", e)
        return []
    }
}