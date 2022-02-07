import * as nodemailer from 'nodemailer'
import { Config } from './config';
import { logError } from './logger';
import { ApolloError } from 'apollo-server-errors';
import * as jwtthen from 'jwt-then'
import { User, UserModel } from '../models/user_model';
/**
 * send the message to the specified email
 */
export const sendMail = async (mailOptions: any): Promise<string> => {
    try {
        // create reusable transporter object
        const transporter = nodemailer.createTransport({
            host: Config.nodemailerConfig.service,
            port: 465,
            secure: true, // use SSL
            auth: {
                user: Config.nodemailerConfig.email,
                pass: Config.nodemailerConfig.password,
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);

        return info.messageId
    }
    catch (e) {
        logError('Send verification email failed.', { e });
        throw new ApolloError('send-verification-email-fail', 'Failed to send verification email.');
    }
};

/**
 * @api {post} confirmation for email address
 * @apiDescription 
 *      We use JSON Web Tokens for an email confirmation. 
 *      When registering a new email address, you will receive a link included in the email token string.
 * @apiName Authentication
 * @apiGroup AA Info
 * @apiHeaderExample {json} Request-Example:
 * {
 *    "authorization": [JWT String]
 * }
 */

export const createEmailToken = async (uid: string, email: string): Promise<string> => {
    return await jwtthen.sign({ uid, email }, Config.emailSecret);
}

/**
 * Checks the email token and returns the user.
 */
export const checkEmailToken = async (token: string): Promise<{ user: User, email: string }> => {
    try {
        const decoded = await jwtthen.verify(token, Config.emailSecret) as any;
        const { uid, email } = decoded ?? {};
        const user = await UserModel.findOne({ 'uid': uid })
        if (!user) {
            throw new ApolloError('no-user-exists', 'No user exists with specified user id');
        }
        if (!email) {
            throw new ApolloError('email-not-confirmed', 'The user has an invalid email token.');
        }
        return { user, email };
    } catch (e) {
        logError('email was not confirmed', { e });
        throw new ApolloError('email-not-confirmed', 'The user has an invalid email token.');
    }
}
