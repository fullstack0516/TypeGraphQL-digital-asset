import { ApolloError } from "apollo-server-errors";
import { Page, PageModel } from "../../models/page_model";
import { fetchPage } from "./fetch_page";
import { deleteUndefinedKeys } from "../../helpers/helpers";

/**
 * Updates the page
 */
export const updatePage = async (uid: string, data: any): Promise<Page> => {

    deleteUndefinedKeys(data)

    if (data.contentDraftSections && data.contentDraftSections.length > 80) {
        throw new ApolloError('too-many-sections', 'The user submitted too many content draft sections');
    }

    const page = await fetchPage(uid)

    // @ts-ignore
    delete page._id;

    const updatedPage = {
        ...page,
        ...data,
        ...{ uid },
        ...{
            lastUpdateIso: new Date().toISOString(),
        }
    }

    await PageModel.updateOne({ uid: page.uid }, {
        $set: updatedPage,
    }).exec()

    return updatedPage;
}
