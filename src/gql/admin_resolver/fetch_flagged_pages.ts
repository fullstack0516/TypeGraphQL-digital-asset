import { PageModel } from "../../models/page_model"

export const fetchFlaggedPages = async (fromIso: string) => {
    const flaggedPages = await PageModel.find({
        isFlagged: true,
        isBanned: false,
        lastUpdateIso: { $lte: fromIso }
    })
        .sort({
            lastUpdateIso: -1,
        })
        .limit(20)
        

    return flaggedPages
}
