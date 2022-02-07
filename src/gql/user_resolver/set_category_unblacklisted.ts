import { BlacklistedDataCategoryModel } from "../../models/blacklisted_data_category";
export const setCategoryUnblacklisted = async (categoryName: string, userUid: string) => {
    await unblacklistCategory(categoryName, userUid)
}

const unblacklistCategory = async (category: string, userUid: string) => {
    await BlacklistedDataCategoryModel.deleteMany({
        userUid,
        category,
    })
}
