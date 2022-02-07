import { PageModel } from "../../models/page_model"

export const discoverFetchNewPages = async (category?: string, fromIso?: string) => {
    const daysAgo = 14;
    const daysNAgo = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    let query: any = {
        createdIso: { $gte: daysNAgo.toISOString() },
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    if (fromIso) {
        query.createdIso = { ...query.createdIso, $lte: fromIso }
    }

    const newPages = await PageModel.find(query)
        .sort({
            createdIso: -1,
        })
        .limit(16)
        
    return newPages;
}
