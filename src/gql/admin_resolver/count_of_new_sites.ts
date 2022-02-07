import { SiteModel } from "../../models/site_model";

export const countOfNewSites = async (daysNAgo: number): Promise<{ rate: number, count: number }> => {
    const thisSprintSitesCount = await SiteModel.find({
        createdIso: { $gte: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString(), },
    }).count();

    let lastSprintSitesCount = await SiteModel.find({
        createdIso: {
            $gte: new Date(Date.now() - 2 * daysNAgo * 24 * 60 * 60 * 1000).toISOString(),
            $lt: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString()
        },
    }).count();

    lastSprintSitesCount = lastSprintSitesCount || 1;

    return {
        rate: thisSprintSitesCount / lastSprintSitesCount,
        count: thisSprintSitesCount
    }
}
