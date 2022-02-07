import { SiteModel } from "../../models/site_model"
import { ApolloError } from "apollo-server-errors"
import { Page, PageModel } from "../../models/page_model"

/**
 * Returns undefined if there's no page.
 */
export const fetchPageViaUrl = async (siteUrl: string, pageUrl: string): Promise<Page> => {
    const site = await SiteModel.findOne({
        url: siteUrl,
    })
    if (!site) {
        throw new ApolloError('no-site', 'No site exists from url ' + siteUrl)
    }

    let page = await PageModel.findOne({
        url: pageUrl,
        siteUid: site.uid,
    })
    if (!page) {
        throw new ApolloError('no-page', 'No page exists.')
    }
    // @ts-ignore
    delete page._id
    return page;
}
