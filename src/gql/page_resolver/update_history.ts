import { fetchPage } from "./fetch_page"
import { PageHistory, PageHistoryModel } from "../../models/page_history"
import { createUid } from "../../helpers/helpers"
import { fetchSite } from "../site_resolver/fetch_site"

/**
 * Update the users history. If the item exists update the time, else create new.
 * We return strings to refect what action happened.
 */
export const updateHistory = async (pageUid: string, userUid: string): Promise<'updated' | 'createdNew' | 'pageChanged' | 'pageOwner'> => {
    const page = await fetchPage(pageUid)
    if (page.pageOwner === userUid) {
        return 'pageOwner'
    }
    let pageHistory: PageHistory | null = await PageHistoryModel.findOne({
        pageUid,
        userUid,
    })
    if (pageHistory) {
        await PageHistoryModel.updateOne(
            { uid: pageHistory.uid },
            {
                $set: {
                    lastUpdateIso: new Date().toISOString()
                },
                $inc: { numberOfVisits: 1 }
            }
        ).exec()
        const pagePublishChanged = page.lastPublishIso != pageHistory.lastPagePublishIso;
        // if page publish date was changed, update pageHistory as well, so that make sure datapoints can not be added several times
        if (pagePublishChanged) {
            await PageHistoryModel.updateOne(
                { uid: pageHistory.uid },
                {
                    $set: { lastPagePublishIso: page.lastPublishIso },
                }
            ).exec()
        }
        return pagePublishChanged ? 'pageChanged' : 'updated'
    }

    pageHistory = {
        uid: createUid(),
        userUid,
        numberOfVisits: 1,
        createdIso: new Date().toISOString(),
        lastUpdateIso: new Date().toISOString(),
        lastPagePublishIso: page.lastPublishIso,
        pageUid: page.uid,
        pageUrl: page.url,
        siteUid: page.siteUid,
        siteUrl: await (await fetchSite(page.siteUid)).url,
    }

    await PageHistoryModel.create(pageHistory)

    return 'createdNew'
}
