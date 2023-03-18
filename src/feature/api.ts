import config from "config/config.json"

export const METHOD_GET = "GET"
export const METHOD_POST = "POST"
export const METHOD_PUT = "PUT"

export function makeRequest<T, U>(method: string, path: string, data: T): Promise<U> {
    return new Promise<U>(async (resolve, reject) => {
        try {
            let result = await fetch(`${config.api_url}${path}`, {
                method: method,
                body: JSON.stringify(data),
            })

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

export const ERR_UNKNOWN_CODE = 0

export const ERR_BAD_REQUEST = 2

interface Error {
    code: number
    name: string
    message?: string
}

function unknownError(message?: string): Error {
    return {
        code: ERR_UNKNOWN_CODE,
        name: "ERR_UNKNOWN",
        message: message
    }
}
