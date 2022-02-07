import * as SecretManagerServiceClient from '@google-cloud/secret-manager'
import { ApolloError } from 'apollo-server-errors'
import { MediaLink } from '../models/media_link'

const client = new SecretManagerServiceClient.v1.SecretManagerServiceClient()

export let Config: ConfigI

export const initConfig = async (): Promise<ConfigI> => {
    console.log('Loaded project id: ' + getProjectId())

    const secrets = await client.accessSecretVersion({
        name: `projects/${getProjectId()}/secrets/config/versions/latest`,
    })

    if (!secrets || !secrets[0]) {
        throw new ApolloError('could-not-find-secrets', 'Secrets was null.')
    }

    const secret = secrets[0]!

    // @ts-ignore
    const payload = JSON.parse(secret.payload.data.toString())
    Config = { ...payload }

    // @ts-ignore
    return Config
}

export const greyImage = 'https://storage.googleapis.com/trivsel-a74a1.appspot.com/dummy_photos/dummy_content_image.png';

export interface ConfigI {
    productCode: string
    productName: string
    googleCloudApiKey: string
    projectLocation: string,
    privateKey: string,
    clientEmail: string,
    jwtSecret: string;
    emailSecret: string;
    dummyProfilePhotos: Array<MediaLink>;
    // Used for multiple things like JWT signatures.
    serverToken: string
    // Such as gs://some-storage
    cloudStorage: string
    // Must not end with a slash
    databaseUrl: string
    redis: string
    nodemailerConfig: {
        email: string;
        password: string;
        service: string;
    },
    sms: {
        vontageKey: string
        vontageSecret: string
    },
}

export const getProjectId = () => {
    return process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT
}
