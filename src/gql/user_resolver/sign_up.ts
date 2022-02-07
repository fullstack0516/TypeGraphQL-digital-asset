import { User, UserModel } from "../../models/user_model";
import { ApolloError } from "apollo-server-errors";
import { createUid } from "../../helpers/helpers";
import { randomDummyProfilePhoto } from "../../helpers/helpers_photos";

export const signUp = async (username: string, phoneNumber: string): Promise<User> => {
    if (username) {
        const checkUsernameUser = await UserModel.findOne({ username });
        if (checkUsernameUser) {
            throw new ApolloError('username-exists', 'Username exists.');
        }
        // Make the user.
        const user: User = {
            uid: createUid(),
            username: username,
            phoneNumber: phoneNumber,
            profileMedia: randomDummyProfilePhoto(),
            createdIso: new Date().toISOString(),
            isDeleted: false,
            isFlagged: false,
            isBanned: false,
            isAdmin: false,
            lastOpenedAppIso: new Date().toISOString(),
            // reports: {}, // TODO : comment for now since it was not used at all
            totalImpressionsOnSites: 0,
            totalVisitsOnSites: 0,
        };
        await UserModel.create(user);

        return user;
    } else {
        throw new ApolloError('no-username-on-signup', 'You provided an SMS number that does not exist with no username.');
    }
};
