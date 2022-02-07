import { UserModel } from "../../models/user_model"

export const fetchNewUsers = async (fromIso?: string) => {
    let query: any = {
        isDeleted: false,
        isBanned: false
    }

    if (fromIso) {
        query.createdIso = { $lte: fromIso }
    }

    const newUsers = await UserModel.find(query)
        .sort({
            createdIso: -1,
        })
        .limit(8)
        
    return newUsers;
}
