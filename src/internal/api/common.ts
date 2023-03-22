import config from "config/config.json"

export const RETRY_TIMEOUT = 2000

export interface ApiError {
    code: number
    name: string
    message?: string
}

export class CommonErrors {
    static ERR_UNKNOWN = 0;
    static ERR_UNAUTHORIZED = 1;
    static ERR_BAD_REQUEST = 2;
    static ERR_FORBIDDEN = 3;
    static ERR_NOT_IMPLEMENTED = 4;
}

export class HttpMethods {
    static GET = "GET"
    static POST = "POST"
    static PUT = "PUT"
}

export async function makeHttpRequest<T, U>(method: string, path: string, data: T): Promise<U> {
    // await timeout(200)

    return new Promise<U>(async (resolve, reject) => {
        try {
            let init: RequestInit = {
                method,
                credentials: "include"
            }

            if (method !== HttpMethods.GET) {
                init.body = JSON.stringify(data)
            }

            let result = await fetch(`${config.addresses.api}${path}`, init)
            let resultData = await result.json()

            if (result.status < 300) {
                resolve(resultData as U)

                return
            }

            // Logging all errors
            console.warn("api: error", resultData)

            reject(resultData as Error)

        } catch (e) {
            let err = unknownError(e)

            // Logging all errors
            console.error("api: unknown error", err)

            reject(err)
        }
    })
}

function unknownError(message?: string): ApiError {
    return {
        code: CommonErrors.ERR_UNKNOWN,
        name: "ERR_UNKNOWN",
        message: message
    }
}

export function parseApiTime(time: string): Date {
    return new Date(Date.parse(time))
}
