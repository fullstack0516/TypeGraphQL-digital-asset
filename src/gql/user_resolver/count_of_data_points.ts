import { UserDataTagModel } from "../../models/user_data_tag";

export const countOfDataPoints = async (userUid: string): Promise<number> => {
    return await UserDataTagModel.find({
        userUid,
    }).count()
}
