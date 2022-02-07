import { Site, SiteModel } from "../../models/site_model"
import { deleteUndefinedKeys } from "../../helpers/helpers";
import { fetchSite } from "./fetch_site";

export const updateSite = async (uid: string, data: any): Promise<Site> => {
    deleteUndefinedKeys(data)
    const site = await fetchSite(uid)
    // @ts-ignore
    delete site._id;
    const updatedSite = {
        ...site,
        ...data,
        ...{
            lastSiteUpdatedIso: new Date().toISOString(),
        }
    }
    await SiteModel.updateOne({ uid: site.uid }, {
        $set: updatedSite,
    })

    return updatedSite;
}
