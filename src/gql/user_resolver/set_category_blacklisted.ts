import { ApolloError } from "apollo-server-errors";
import { BlacklistedDataCategoryModel, BlacklistedDataCategory } from "../../models/blacklisted_data_category";
import { UserDataTagModel } from "../../models/user_data_tag";

export const setCategoryBlacklisted = async (categoryName: string, userUid: string) => {
    await blacklistCategory(categoryName, userUid)
}
/**
 * This will delete the data.
 */
const blacklistCategory = async (category: string, userUid: string) => {

    // Check it doesn't exist
    const blackListedCategory = await BlacklistedDataCategoryModel.findOne({
        category,
        userUid,
    })
    if (blackListedCategory) {
        throw new ApolloError('already-blacklisted', 'Already blacklisted this datacategory')
    }

    const blacklistCategoryNew: BlacklistedDataCategory = {
        category,
        userUid,
    }

    await BlacklistedDataCategoryModel.create(blacklistCategoryNew)

    // Delete the data.
    await UserDataTagModel.deleteMany({
        userUid,
        contentCategories: { $in: [category] },
    })
}
