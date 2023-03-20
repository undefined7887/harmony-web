import {base64toUTF8} from "@47ng/codec";
import {setCookie} from "src/internal/utils/http";

const JWT_COOKIE_NAME = "token"

export interface JwtStandardClaims {
    iss: string
    sub: string
    exp: number
    iat: number,
    jti: string
}

export function getJwtClaims<T>(token: string): T {
    return JSON.parse(base64toUTF8(token.split(".")[1]))
}

export function setJwtCookie(token: string) {
    let claims = getJwtClaims<JwtStandardClaims>(token)

    setCookie(JWT_COOKIE_NAME, token, claims.exp)
}
