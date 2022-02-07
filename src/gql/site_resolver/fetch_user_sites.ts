import { SiteModel } from '../../models/site_model'

export const fetchUserSites = async (userUid: string, fromIso: string) => {
    const sites = await SiteModel.find(
        {
            siteOwnersUids: { $in: [userUid] },
            isDeleted: false,
            lastSiteUpdatedIso: { $lte: fromIso }
        }
    )
        .sort({
            lastSiteUpdatedIso: -1,
        })
        .limit(20)

    return sites;
}
