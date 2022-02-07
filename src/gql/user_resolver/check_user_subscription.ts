import { SubscriptionModel } from "../../models/subscription";
import { fetchSite } from "../site_resolver/fetch_site";

export const checkUserSubscription = async (userUid: string, siteUid: string) => {
    // Check it exists.
    await fetchSite(siteUid)
    const sub = await SubscriptionModel.findOne({ userUid, siteUid }).exec();
    return !!sub;
}
