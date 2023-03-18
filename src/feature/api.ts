import config from "config/config.json"
import {Simulate} from "react-dom/test-utils";
import {getJwtClaims} from "src/feature/utils";

export const METHOD_GET = "GET"
export const METHOD_POST = "POST"
export const METHOD_PUT = "PUT"

export function makeRequest<T, U>(method: string, path: string, data: T): Promise<U> {
    return new Promise<U>(async (resolve, reject) => {
        try {
            let init: RequestInit = {
                method,
                credentials: "include"
            }

            if (method !== METHOD_GET) {
                init.body = JSON.stringify(data)
            }

            let result = await fetch(`${config.api_url}${path}`, init)
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

const COOKIE_NAME = "token"

export function setToken(token: string) {
    let claims = getJwtClaims<{ exp: number }>(token)

    // Getting public url from config
    let publicUrl = new URL(config.public_url)

    // Getting expires from token
    let expires = new Date(claims.exp * 1000).toUTCString()

    // If apiUrl uses https:// protocol enabling secure cookies
    let secure = publicUrl.protocol === "https://" ? "Secure" : ""

    document.cookie = `${COOKIE_NAME}=${token}; expires=${expires}; domain=${publicUrl.hostname}; path=/; ${secure}`
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
