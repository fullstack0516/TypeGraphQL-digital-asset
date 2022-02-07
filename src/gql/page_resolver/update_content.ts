import {
    ContentHeader,
    ContentImageRow,
    ContentSection,
    ContentTypes,
    ContentTripleImageCol,
    ContentTextBlock,
    ContentTextImageLeft,
    ContentTextImageRight,
    ContentVideoRowEmbed,
    ContentVideoBlock
} from "../../models/content_section";
import { fetchPage } from "./fetch_page";
import { updatePage } from "./update_page";
import { markdownToHtml } from "../../helpers/helpers";
import { greyImage } from "../../helpers/config";
import { ApolloError } from "apollo-server-errors";
import { deleteFileViaUrl } from "../../helpers/helper_storage";

/**
 * The text should be markdown.
 */
export const updateContent = async (props: {
    pageUid: string,
    contentSectionUid: string,
    newImageUrl?: string,
    newText?: string,
    newTitle?: string,
    processing?: boolean,
    newVideoUrl?: string,
    deleteImage?: boolean,
    deleteVideoUrl?: boolean,
    nthImage?: number,
}): Promise<ContentSection<ContentTypes>> => {
    const { pageUid, contentSectionUid, newImageUrl, newText, deleteImage, newVideoUrl, deleteVideoUrl, nthImage, newTitle, processing } = props;

    const page = await fetchPage(pageUid)

    const updateSection = async (contentSection: ContentSection<ContentTypes>) => {
        const contentDraftSections = page.contentDraftSections.map((cs) => {
            if (cs.uid === contentSection.uid) {
                return contentSection;
            }
            return cs;
        })
        await updatePage(page.uid, { contentDraftSections })
        return contentSection;
    }

    const contentSection = page.contentDraftSections.filter((cs) => cs.uid === contentSectionUid)[0]

    if (contentSection.type == 'header') {
        let updatedSection = contentSection as ContentSection<ContentHeader>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'image-row') {
        let updatedSection = contentSection as ContentSection<ContentImageRow>;
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl!,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'triple-image-col') {
        let updatedSection = contentSection as ContentSection<ContentTripleImageCol>;
        if (newImageUrl || deleteImage) {
            let oldImage;
            const url = deleteImage ? greyImage : newImageUrl!;
            if (nthImage !== undefined && nthImage <= 2) {
                oldImage = updatedSection.content.images[nthImage];
                updatedSection.content.images[nthImage] = { type: 'photo', url };
                await deleteImageFileIfNotPublic(pageUid, oldImage.url)
            }
            else {
                throw new ApolloError('undefined-image-position', 'image position is required for tirple-image-col content section');
            }

        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-block') {
        let updatedSection = contentSection as ContentSection<ContentTextBlock>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-image-left') {
        let updatedSection = contentSection as ContentSection<ContentTextImageLeft>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl!,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'text-image-right') {
        let updatedSection = contentSection as ContentSection<ContentTextImageRight>;
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        if (newImageUrl || deleteImage) {
            const oldImage = updatedSection.content.image;
            updatedSection.content.image = {
                type: 'photo',
                url: deleteImage ? greyImage : newImageUrl!,
            };
            await deleteImageFileIfNotPublic(pageUid, oldImage.url)
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'video-row-embed-only') {
        let updatedSection = contentSection as ContentSection<ContentVideoRowEmbed>;
        if (newVideoUrl) {
            updatedSection.content.link = newVideoUrl
        }
        if (deleteVideoUrl) {
            updatedSection.content.link = '';
        }
        return await updateSection(updatedSection)
    }

    if (contentSection.type == 'video-block') {
        let updatedSection = contentSection as ContentSection<ContentVideoBlock>;
        if (newVideoUrl) {
            updatedSection.content.video.url = newVideoUrl
            updatedSection.content.video.type = 'video'
        }
        if (deleteVideoUrl) {
            updatedSection.content.video.url = ''
            updatedSection.content.video.type = 'video'
        }
        if (newText) {
            updatedSection.content.text = {
                markdown: newText,
                html: markdownToHtml(newText),
            };
        }
        if (newTitle) {
            updatedSection.content.title = newTitle
        }
        if (processing) {
            updatedSection.content.processing = true
        }
        return await updateSection(updatedSection)
    }

    throw new ApolloError('unknown-content-section', 'Either we could not find this content section on the page, or its an unknown type.')
}

/**
 * Deleting draft images should not delete public images.
 */
const deleteImageFileIfNotPublic = async (pageUid: string, url: string) => {
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
