import { deleteUndefinedKeys } from "../../helpers/helpers";
import { Page, PageModel } from "../../models/page_model";
import { fetchPage } from "../page_resolver/fetch_page";

/**
 * Updates the page
 */
export const updatePage = async (uid: string, data: any): Promise<Page> => {

    deleteUndefinedKeys(data)

    const page = await fetchPage(uid)

    // @ts-ignore
    delete page._id;

    const updatedPage = {
        ...page,
        ...data,
        ...{ uid },
    }

    await PageModel.updateOne({ uid: page.uid }, {
        $set: updatedPage,
    })

    return updatedPage;
}
