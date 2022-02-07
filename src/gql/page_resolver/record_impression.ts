import { fetchSite } from "../site_resolver/fetch_site"
import { fetchPage } from "./fetch_page"
import { PageModel } from "../../models/page_model"
import { asyncForEach } from "../../helpers/helpers"
import { SiteModel } from "../../models/site_model"
import { UserModel } from "../../models/user_model"

export const recordImpression = async (pageUid: string) => {
    const page = await fetchPage(pageUid)
    const site = await fetchSite(page.siteUid)

    // Update page impressions
    await PageModel.updateOne(
        { uid: pageUid }, {
        $inc: {
            totalImpressions: 1,
        }
    })
    // Update site impressions
    await SiteModel.updateOne(
        { uid: page.siteUid }, {
        $inc: {
            totalImpressions: 1,
        }
    })
    await asyncForEach(site.siteOwnersUids, async (ownerUid) => {
        // Update user impressions.
        await UserModel.updateOne(
            { uid: ownerUid }, {
            $inc: {
                totalImpressionsOnSites: 1,
            }
        })
    })
}
