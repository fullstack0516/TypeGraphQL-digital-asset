import { Page, PageModel } from "../../models/page_model"

export const fetchNewPages = async (pageNum: number, showCount: number): Promise<{ totalCount: number, pages: Page[] }> => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        isDeleted: false,
        createdIso: { $gte: daysNAgo.toISOString() },
    }
    const totalCount = await PageModel.find(query).count()
    const pages = await PageModel.find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)

    return { totalCount, pages };
}
