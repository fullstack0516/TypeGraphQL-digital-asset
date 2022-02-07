import { PageModel } from '../../models/page_model'

export const fetchNewPages = async (siteUid: string, fromIso?: string) => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    let query: any = {
        siteUid,
        isPublished: true,
        isDeleted: false,
        createdIso: { $gt: daysNAgo.toISOString() },
    }

    if (fromIso) {
        query.createdIso = { ...query.createdIso, $lt: fromIso }
    }

    const newPages = await PageModel.find(query)
        .sort({
            createdIso: -1,
        })
        .limit(8)

    return newPages
}
