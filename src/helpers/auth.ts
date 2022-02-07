import express from 'express'
import * as jwtthen from 'jwt-then'
import { AuthChecker } from 'type-graphql'
import { Context } from 'vm'
import { User, UserModel } from '../models/user_model'
import { Config } from './config'
import { isDev } from './helpers'
import { logger } from './logger'
import { ApolloError } from 'apollo-server-errors';
import { AuthenticationError } from 'apollo-server-errors'

/**
 * Attach the user object if they present the authentication token.
 */
export const attachUserObject = async (req: express.Request) => {
    let token = req.headers.authorization ?? ''
    try {
        if (token) {
            if (Array.isArray(token)) {
                token = token[0]
            }

            const decoded = (await jwtthen.verify(token, Config.serverToken)) as any
            const user = await UserModel.findOne({ uid: decoded.uid })

            if (!user) {
                if (isDev()) {
                    logger.error('JWT token error, invalid user.')
                }
            }

            return user
        }
    } catch (e) {
        logger.error(e)
    }
    return undefined
}


export const customAuthChecker: AuthChecker<Context> = ({ root, args, context, info }, roles) => {
    if (!context.user) {
        return false
    }
    if (roles[0] == 'ADMIN' && context.user.isAdmin) {
        return true
    }
    return false
}

export const checkUserLoggedIn = (context: Context) => {
    if (!context.user) {
        throw new AuthenticationError('User not logged in.')
    }
}

export const createJwt = async (uid: string): Promise<string> => {
    return await jwtthen.sign({ uid }, Config.serverToken);
}

/**
 * Checks the auth token and returns the user.
 */
export const checkJwt = async (token: string): Promise<User> => {
    try {
        const decoded = await jwtthen.verify(token, Config.serverToken) as any
        const user = await UserModel.findOne({ 'uid': decoded.uid })
        if (!user) {
            throw new ApolloError('not-authenticated', 'The user has an invalid auth token.')
        }
        return user;
    } catch (e) {
        console.log(e)
        throw new ApolloError('not-authenticated', 'The user has an invalid auth token.');
    }
}
