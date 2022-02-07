import { UserModel } from '../../models/user_model'

export const getAllUsers = async (fromIso?: string) => {
    const users = await UserModel.find({
        createdIso: { $lte: fromIso ?? new Date().toISOString() },
    }).sort({ createdIso: -1 })
    return users
}
