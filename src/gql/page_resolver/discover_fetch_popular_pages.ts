import { Page, PageModel } from "../../models/page_model"

export const discoverFetchPopularPages = async (itemNumber: number, category?: string): Promise<{
    pages: Page[],
    itemNumber: number
}> => {
    const loadCount = 16
    let query: any = {
        totalVisits: { $gte: 1 },
        isFlagged: false,
        isBanned: false,
        isDeleted: false,
        isPublished: true,
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
