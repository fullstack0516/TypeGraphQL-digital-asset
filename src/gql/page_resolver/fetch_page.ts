import { ApolloError } from "apollo-server-errors"
import { Page, PageModel } from "../../models/page_model"
/**
 * Returns undefined if there's no page.
 */
export const fetchPage = async (uid: string): Promise<Page> => {
    let page = (await PageModel.findOne({ uid }).exec())?.toObject()
    if (!page) {
        throw new ApolloError('no-page', 'No page exists.')
    }
    // @ts-ignore
    delete page._id

    return page;
}
