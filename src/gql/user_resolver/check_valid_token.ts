import { ApolloError } from "apollo-server-errors";
import { checkJwt } from "../../helpers/auth";

export const checkValidToken = async (jwt: string) => {
    try {
        await checkJwt(jwt);

    } catch (e) {
        throw new ApolloError('invalid-token', 'This is invalid JWT token');
    }
};