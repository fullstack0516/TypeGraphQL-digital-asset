import { SubscriptionModel } from "../../models/subscription";
import { ApolloError } from "apollo-server-errors";

export const unsubscribeUserToSite = async (userUid: string, siteUid: string) => {
    const sub = await SubscriptionModel.findOne({ userUid, siteUid }).exec();
    if (!sub) {
        throw new ApolloError('the-sub-does-not-exist', 'The subscription does not exist.')
    }

    await SubscriptionModel.deleteOne({ uid: sub.uid }).exec()
}
