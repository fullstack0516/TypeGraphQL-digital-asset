import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'
import { createJwt } from '../../helpers/auth'
import { createUid } from '../../helpers/helpers'
import { signUp } from '../user_resolver/sign_up'
import { User } from '../../models/user_model'

export const createUsername = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 3,
        style: 'capital',
    }).substr(0, 12) + createUid().substring(0, 5);
}

export const makeFakeNumber = () => {
    // +19999 is a special number that ignores verificaiton.
    return '+19999' + Math.floor(Math.random() * 1000000);
}

export const createTestUser = async (): Promise<{ user: User, jwt: string }> => {
    // create test user
    const user = await signUp(createUsername(), makeFakeNumber())
    const jwt = await createJwt(user.uid)

    return {
        user, jwt
    }
}
