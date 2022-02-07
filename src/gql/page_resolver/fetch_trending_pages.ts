import { PageModel } from "../../models/page_model"

export const fetchTrendingPages = async (siteUid: string, totalVisits?: number) => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (totalVisits) {
        query.totalVisits = { $lte: totalVisits }
    }

    const newPages = await PageModel.find(query)
        .sort({
            totalVisits: -1,
        })
        .limit(8)
        
    return newPages;
}