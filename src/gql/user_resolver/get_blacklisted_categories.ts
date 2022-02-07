import { BlacklistedDataCategoryModel } from "../../models/blacklisted_data_category";

export const getBlacklistedCategories = async (userUid: string) => {
    const blackListedCategories = await BlacklistedDataCategoryModel.find({
        userUid,
    })
    return blackListedCategories;
}