import { ApolloError } from "apollo-server-errors"
import { User, UserModel } from "../../models/user_model"
/**
 * Returns undefined if there's no user.
 */
export const fetchUser = async (uid: string): Promise<User> => {
    let user = (await UserModel.findOne({ uid }))?.toObject()

    if (!user) {
        throw new ApolloError('no-user', 'No user exists.')
    }
    // @ts-ignore
    delete user._id

    return user;
}
