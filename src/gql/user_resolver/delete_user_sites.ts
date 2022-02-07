import { SiteModel } from "../../models/site_model"
import { asyncForEach } from "../../helpers/helpers"
import { updateSite } from "../site_resolver/update_site"
import { deleteSite } from "../site_resolver/delete_site"

/**
 * Removes the user from the site or deletes it if they are the only one.
 */
export const deleteUserSites = async (userUid: string) => {
    const sites = await SiteModel.find({ siteOwnersUids: { $in: [userUid], } })

    await asyncForEach(sites, async site => {
        if ((site).siteOwnersUids.length > 1) {
            // Just remove the user.
            (site).siteOwnersUids = (site).siteOwnersUids.filter((owner) => owner != userUid)
            await updateSite((site).uid, { siteOwnersUids: (site).siteOwnersUids })
        } else {
            await deleteSite((site).uid)
        }
    })
}
