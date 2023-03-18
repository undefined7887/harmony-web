import {base64toUTF8, hex} from "@47ng/codec";

export function timeout(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    })
}

export function makeUrlWithParams(url: string, params: object): string {
    let result = new URL(url)

    Object
        .entries(params)
        .forEach(([param, value]) => {
            result.searchParams.append(param, value)
        })

    return result.toString()
}

export function randomHex(size: number): string {
    return hex.encode(randomUint8Array(size))
}

export function randomUint8Array(size: number): Uint8Array {
    let result = new Uint8Array(size)
    crypto.getRandomValues(result)

    return result
}

export function getJwtClaims<T>(token: string): T {
    return JSON.parse(base64toUTF8(token.split(".")[1]))
}
