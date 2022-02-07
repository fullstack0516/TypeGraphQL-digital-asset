import { User } from "../../models/user_model"
import { fetchUser } from "./fetch_user"
import { UserLight } from "../../models/user_light_model";
import { ApolloError } from "apollo-server-errors";
/**
 * Returns undefined if there's no user.
 */
const createUserLight = (user: User) => {
    const userLight: UserLight = {
        uid: user.uid,
        username: user.username,
        profileMedia: user.profileMedia,
    };
    return userLight;
}
export const fetchUserLight = async (userLightUid: string): Promise<UserLight> => {
    const user = await fetchUser(userLightUid)
    if (!user) {
        throw new ApolloError('no-user-found', 'Could not process userlight as there was no user')
    }
    const userLight = createUserLight(user);
    return userLight;
}
