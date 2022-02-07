import { UserDataTagModel } from "../../models/user_data_tag";

export const countOfDataPoints = async (): Promise<number> => {
  return await UserDataTagModel.countDocuments();
}
