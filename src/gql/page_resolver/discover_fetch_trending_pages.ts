import { PageModel } from "../../models/page_model"

export const discoverFetchTrendingPages = async (itemNumber: number, category?: string) => {
    const loadCount = 16
    const daysNAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    let query: any = {
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
        createdIso: { $gte: daysNAgo.toISOString() },
    }

    if (category) {
        query.contentCategories = { $in: [category] }
    }

    const newPages = await PageModel.find(query)
        .sort({
            totalVisits: -1,
        })
        .skip(itemNumber)
        .limit(loadCount)

    return {
        pages: newPages,
        itemNumber: itemNumber + loadCount
    };
}
