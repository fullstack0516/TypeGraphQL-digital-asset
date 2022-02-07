import {
    ContentHeader,
    ContentImageRow,
    ContentSection,
    ContentSectionTypes,
    ContentTypes,
    ContentTripleImageCol,
    ContentTextBlock,
    ContentTextImageLeft,
    ContentTextImageRight,
    ContentVideoRowEmbed,
    ContentVideoBlock,
} from "../../models/content_section";
import { createUid } from "../../helpers/helpers";
import { greyImage } from "../../helpers/config";

export const makeContentSection = (type: ContentSectionTypes): ContentSection<ContentTypes> => {
    let section;
    if (type == 'header') {
        (section as ContentHeader) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            }
        }
    }

    if (type == 'image-row') {
        (section as ContentImageRow) = {
            uid: createUid(),
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'triple-image-col') {
        (section as ContentTripleImageCol) = {
            uid: createUid(),
            images: [
                // full-image
                { url: greyImage, type: 'photo', },
                // half-first-image
                { url: greyImage, type: 'photo', },
                // half-second-image
                { url: greyImage, type: 'photo', }
            ]
        }
    }

    if (type == 'text-block') {
        (section as ContentTextBlock) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            }
        }
    }

    if (type == 'text-image-left') {
        (section as ContentTextImageLeft) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            },
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'text-image-right') {
        (section as ContentTextImageRight) = {
            uid: createUid(),
            text: {
                html: '',
                markdown: '',
            },
            image: {
                url: greyImage,
                type: 'photo',
            }
        }
    }

    if (type == 'video-row-embed-only') {
        (section as ContentVideoRowEmbed) = {
            uid: createUid(),
            link: ''
        }
    }

    if (type == 'video-block') {
        (section as ContentVideoBlock) = {
            uid: createUid(),
            video: {
                type: 'video',
                url: '',
            },
            text: {
                html: '',
                markdown: '',
            },
            title: '',
            processing: false,
        }
    }

    const contentSection: ContentSection<ContentTypes> = {
        uid: createUid(),
        type,
        content: section,
    }

    return contentSection;
}
