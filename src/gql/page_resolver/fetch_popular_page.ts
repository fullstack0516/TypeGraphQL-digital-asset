import { PageModel } from "../../models/page_model"

export const fetchPopularPages = async (siteUid: string, totalVisits?: number) => {
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
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
