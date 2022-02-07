import { SiteModel } from "../../models/site_model";

export const isSiteUrlUnique = async (url: string): Promise<boolean> => {
    const site = await SiteModel.findOne({ url })

    return !site;
}
