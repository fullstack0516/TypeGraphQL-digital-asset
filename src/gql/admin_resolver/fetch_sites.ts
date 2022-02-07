import { Site, SiteModel } from "../../models/site_model";

export const fetchSites = async (pageNum: number, showCount: number): Promise<{ totalCount: number, sites: Site[] }> => {
    let query: any = {
        isDeleted: false,
    }
    const totalCount = await SiteModel.find(query).count()
    const sites = await SiteModel.find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)

    return { totalCount, sites };
}
