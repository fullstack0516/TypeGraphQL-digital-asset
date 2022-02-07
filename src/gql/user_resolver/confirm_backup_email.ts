import { User } from '../../models/user_model'
import { updateUser } from './update_user';
import { fetchUser } from './fetch_user';
/**
 * Confirm Backup Email
 */
export const confirmBackupEmail = async (email: string, user: User): Promise<any> => {
    // update the user information
    await updateUser(user.uid, { email: email });

    return { user: await fetchUser(user.uid) };
}
