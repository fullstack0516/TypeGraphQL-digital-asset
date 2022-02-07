import { PageModel } from "../../models/page_model";
export const fetchSitePages = async (siteUid: string, fromIso: string) => {
    const newPages = await PageModel.find({
        siteUid,
        createdIso: { $lte: fromIso },
        isDeleted: false,
    })
        .sort({
            createdIso: -1,
        })
        .limit(20)
        
    return newPages;
}