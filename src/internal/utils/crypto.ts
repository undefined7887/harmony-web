import {hex} from "@47ng/codec";

export function randomHex(size: number): string {
    return hex.encode(randomUint8Array(size))
}

export function randomUint8Array(size: number): Uint8Array {
    let result = new Uint8Array(size)
    crypto.getRandomValues(result)

    return result
}
