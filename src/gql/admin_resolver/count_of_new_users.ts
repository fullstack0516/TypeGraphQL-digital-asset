import { UserModel } from "../../models/user_model";

export const countOfNewUsers = async (daysNAgo: number): Promise<{ rate: number, count: number }> => {
    const thisSprintUsersCount = await UserModel.find({
        createdIso: { $gte: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString() },
    }).count();

    let lastSprintUsersCount = await UserModel.find({
        createdIso: {
            $gte: new Date(Date.now() - 2 * daysNAgo * 24 * 60 * 60 * 1000).toISOString(),
            $lt: new Date(Date.now() - daysNAgo * 24 * 60 * 60 * 1000).toISOString()
        },
    }).count();

    lastSprintUsersCount = lastSprintUsersCount || 1;

    return {
        rate: thisSprintUsersCount / lastSprintUsersCount,
        count: thisSprintUsersCount
    }
}
