import { SiteModel } from "../../models/site_model"

export const fetchPopularSites = async (totalVisits?: number) => {
    let query: any = {
        totalVisits: { $gte: 1 },
        isDeleted: false,
    }

    if (totalVisits) {
        query.totalVisits = { $lte: totalVisits }
    }

    const sites = await SiteModel.find(query)
        .sort({
            totalVisits: -1,
        })
        .limit(8)
        
    return sites;
}
