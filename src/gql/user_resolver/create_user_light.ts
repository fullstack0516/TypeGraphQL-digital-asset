import { User } from "../../models/user_model";
import { UserLight } from "../../models/user_light_model";

export const createUserLight = (user: User) => {
    const userLight: UserLight = {
        uid: user.uid,
        username: user.username,
        profileMedia: user.profileMedia,
    };

    return userLight;
}
