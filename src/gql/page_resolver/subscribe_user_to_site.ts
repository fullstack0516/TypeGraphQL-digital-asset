import { fetchSite } from "../site_resolver/fetch_site";
import { SubscriptionModel, Subscription } from "../../models/subscription";
import { createUid } from "../../helpers/helpers";
import { ApolloError } from "apollo-server-errors";

export const subscribeUserToSite = async (userUid: string, siteUid: string) => {
    // Check it exists.
    await fetchSite(siteUid)
    const sub = await SubscriptionModel.findOne({ userUid, siteUid }).exec();
    if (sub) {
        throw new ApolloError('already-subscribed', 'The subscription already does exist.')
    }

    const subscription: Subscription = {
        uid: createUid(),
        subscriptionIso: new Date().toISOString(),
        siteUid,
        userUid,
    }

    await SubscriptionModel.create(subscription)
}
