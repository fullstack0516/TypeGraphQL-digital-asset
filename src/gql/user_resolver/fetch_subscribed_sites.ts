import { Site } from "../../models/site_model";
import { SubscriptionModel } from "../../models/subscription";
import { asyncForEach } from "../../helpers/helpers";
import { fetchSite } from "../site_resolver/fetch_site";

export const fetchSubscribedSites = async (userUid: string): Promise<Site[]> => {
    const subs = await SubscriptionModel.find({
        userUid,
    })

    const sites: Site[] = [];

    await asyncForEach(subs, async eachSub => {
        sites.push(await fetchSite((eachSub).siteUid))
    })

    return sites;
}
