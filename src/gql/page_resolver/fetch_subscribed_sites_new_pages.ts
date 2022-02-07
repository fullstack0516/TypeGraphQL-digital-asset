import { SubscriptionModel } from "../../models/subscription";

export const fetchSubscribedSitesNewPages = async (userUid: string) => {
    const daysNAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    const res = await SubscriptionModel.aggregate([
        {
            $match: {
                userUid
            }
        },
        {
            $lookup: {
                from: 'pages',
                let: { siteUid: '$siteUid' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$$siteUid', '$siteUid'] },
                            isPublished: true,
                            isDeleted: false,
                            createdIso: { $gt: daysNAgo.toISOString() },
                        },
                    },
                ],
                as: 'pages'
            }
        },
    ])

    return res.map(e => e.pages).flat()

}
