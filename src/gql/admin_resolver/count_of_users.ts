import { UserModel } from "../../models/user_model";

export const countOfUsers = async (): Promise<number> => {
    return await UserModel.countDocuments();
}
