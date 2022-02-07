import { deleteUndefinedKeys } from '../../helpers/helpers'
import { User, UserModel } from '../../models/user_model'
import { fetchUser } from './fetch_user'

export const updateUser = async (uid: string, data: any): Promise<User> => {
    deleteUndefinedKeys(data)
    const user = await fetchUser(uid)
    const updateUserData: User = {
        ...user,
        ...data,
        ...{ uid },
    }

    // @ts-ignore
    delete updateUserData._id

    await UserModel.updateOne(
        { uid },
        {
            $set: updateUserData,
        },
    )
    return updateUserData;
}