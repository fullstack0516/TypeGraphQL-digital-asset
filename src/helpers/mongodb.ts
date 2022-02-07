import mongoose, { Mongoose } from 'mongoose'
import { Config } from './config'
import { isDev } from './helpers'

export let mongooseDb: Mongoose

function setRunValidators() {
    // @ts-ignore
    this.setOptions({ runValidators: true, new: true })
}
mongoose.plugin((schema) => {
    schema.pre('findOneAndUpdate', setRunValidators)
    schema.pre('updateMany', setRunValidators)
    schema.pre('updateOne', setRunValidators)
    schema.pre('update', setRunValidators)
})

export const initMongo = async () => {
    if (isDev()) {
        mongooseDb = await mongoose.connect('mongodb://127.0.0.1:27017/' + Config.productCode)
    } else {
        mongooseDb = await mongoose.connect(Config.databaseUrl)
    }
}
