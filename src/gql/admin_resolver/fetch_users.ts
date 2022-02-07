import { User, UserModel } from "../../models/user_model";

export const fetchUsers = async (pageNum: number, showCount: number): Promise<{ totalCount: number, users: User[] }> => {
    let query: any = {
        isDeleted: false,
    }
    const totalCount = await UserModel.find(query).count()
    const users = await UserModel.find(query)
        .sort({ createdIso: -1 })
        .skip(showCount * (pageNum - 1))
        .limit(showCount)

    return { totalCount, users };
}
