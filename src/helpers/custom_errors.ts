import { AuthenticationError } from 'apollo-server-errors'

export const notLoggedIn = new AuthenticationError('not-logged-in', { helper: 'The user must be logged in to do this.' })
