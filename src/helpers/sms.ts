import { ApolloError } from 'apollo-server-errors'
import Nexmo, { ControlResponse, CheckResponse, MessageError, MessageRequestResponse, RequestResponse, VerifyError } from 'nexmo'
const NexmoCon = require('nexmo')
import { Config } from './config'

let nexmo: Nexmo

export const initSMS = () => {
    nexmo = new NexmoCon({
        apiKey: Config.sms.vontageKey,
        apiSecret: Config.sms.vontageSecret,
    })
}

interface ExtendedNexmoRequestResponse extends RequestResponse {
    error_text?: string
}

interface ExtendedNexmoCheckResponse extends CheckResponse {
    error_text?: string
}

interface ExtendedNexmoControlResponse extends ControlResponse {
    error_text?: string
}

/**
 * Return the verification id needed.
 */
export const sendPhoneNumberForCode = async (phoneNumber: string): Promise<string> => {
    const result = await new Promise(async (resolve: (value: ExtendedNexmoRequestResponse) => void, reject: (value: VerifyError) => void) => {
        await nexmo.verify.request(
            {
                number: phoneNumber,
                brand: `${Config.productName}`,
                code_length: 4,
                workflow_id: 6,
            },
            (err, result) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(result)
            }
        )
    })

    // success
    if (result.status === '0') {
        return result.request_id
    }
    // invalid phone number
    if (result.status === '3') {
        throw new ApolloError('invalid-number', 'Invalid Phone number')
    }
    // concurrent verification to the same number
    if (result.status === '10') {
        throw new ApolloError('concurrent-send-sms', 'Concurrent verifications to the same number are not allowed')
    }

    throw new ApolloError('send-smscode-failed', result.error_text)
}

export const confirmSMSCode = async (code: string, verificationId: string) => {
    const result = await new Promise(async (resolve: (value: ExtendedNexmoCheckResponse) => void, reject: (value: VerifyError) => void) => {
        await nexmo.verify.check(
            {
                request_id: verificationId,
                code,
            },
            (err, result) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(result)
            }
        )
    })
    // success
    if (result.status === '0') {
        return true
    }
    // incorrect code or code was expired
    if (result.status === '16') {
        throw new ApolloError('sms-code-incorrect', 'The code provided does not match the expected value')
    }

    throw new ApolloError('sms-confirm-failed', result.error_text)
}

export const retryVerification = async (verificationId: string, phoneNumber: string) => {
    const result = await new Promise(async (resolve: (value: ExtendedNexmoControlResponse) => void, reject: (value: VerifyError) => void) => {
        await nexmo.verify.control(
            {
                request_id: verificationId,
                cmd: 'cancel'
            },
            (err, result) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve(result)
            }
        )
    })

    // status 0: success
    // status 6: particular request_id doesn't exist
    if (result.status === '0' || result.status === '6') {
        return await sendPhoneNumberForCode(phoneNumber);
    }

    // incorrect code or code was expired
    if (result.status === '19') {
        throw new ApolloError('cant-cancel-in-first-thirty-seconds', 'can not be cancelled within the first 30 seconds.')
    }

    throw new ApolloError('sms-resend-failed', result.error_text)
}

// send a text message
export const sendTextMsg = async (from: string, phoneNumber: string, msg: string) => {
    const result = await new Promise(async (resolve: (value: MessageRequestResponse) => void, reject: (value: MessageError) => void) => {
        await nexmo.message.sendSms(from, phoneNumber, msg, {}, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            resolve(result)
        })
    })

    for (const message of result.messages) {
        if (message['error-text']) {
            throw new ApolloError('sms-send-failed', result['error-text'])
        }
    }

    return true
}
