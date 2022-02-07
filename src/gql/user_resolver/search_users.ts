import { UserLight } from '../../models/user_light_model'
import { UserModel } from '../../models/user_model'

const userLightProjection = {
    username: 1,
    uid: 1,
    mediaLink: 1,
}

export const searchUsers = async (searchTerm: string): Promise<UserLight> => {
    const users = await UserModel.find({ name: { $regex: new RegExp(searchTerm, 'i') } }, userLightProjection)
    // @ts-ignore
    return users
}
