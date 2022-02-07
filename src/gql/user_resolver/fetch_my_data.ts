import { UserDataTag, UserDataTagModel } from "../../models/user_data_tag";

export const fetchMyData = async (userUid: string, props: { fromIso: string, category?: string }): Promise<{
    myData: string,
    count: number
}> => {

    const { fromIso, category } = props;

    let tags: UserDataTag[]

    if (category) {
        tags = await UserDataTagModel.find({
            userUid,
            tagRecordedForUserIso: { $lte: fromIso },
            contentCategories: { $in: [category] }
        })
            .sort({
                tagRecordedForUserIso: -1,
            })
            .limit(200)

    } else {
        tags = await UserDataTagModel.find({
            userUid,
            tagRecordedForUserIso: { $lte: fromIso },
        })
            .sort({
                tagRecordedForUserIso: -1,
            })
            .limit(200)
    }

    const tagsByCategory: { [category: string]: UserDataTag[] } = {};
    tags.forEach((tag) => {
        tag.contentCategories.forEach((tagCategory) => {
            if (!tagsByCategory[tagCategory]) {
                tagsByCategory[tagCategory] = [];
            }
            tagsByCategory[tagCategory].push(tag)
        })
    })

    return {
        // TODO: return as String for now since did not find a way how to represent the Map in graphql
        myData: JSON.stringify(tagsByCategory),
        count: tags.length
    };
}
