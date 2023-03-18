import {makeUrlWithParams, randomHex, timeout} from "src/feature/utils";
import {AppThunkAction} from "src/feature/store";

import {ERR_BAD_REQUEST, setToken} from "src/feature/api";
import {methods} from "src/feature/auth/api";
import {ERR_USER_NOT_FOUND} from "src/feature/user/api";
import {actions as authActions, Type} from "src/feature/auth/slice";
import {actions as userActions} from "src/feature/user/slice";

import googleCredentials from "secrets/google_credentials.json";

// Common auth page settings
const PAGE_NAME = "Sign In"
const PAGE_SETTINGS = "scrollbars=no,resizable=no,left=100,top=100,width=500,height=700"
const PAGE_CLOSE_PING = 500

// Google auth specific settings
const GOOGLE_WELL_KNOWN = "https://accounts.google.com/.well-known/openid-configuration"
const GOOGLE_SCOPE = "openid profile email"
const GOOGLE_RESPONSE_TYPE = "id_token"
const GOOGLE_NONCE_SIZE = 16
const GOOGLE_STATE_SIZE = 16

export interface GooglePageResponse {
    success: boolean
    state?: string
    idtoken?: string
}

export interface GoogleResult {
    nonce: string
    idtoken: string
}

export interface GoogleClaims {
    picture: string
    email: string
    email_verified: boolean
}

async function googleAuth(): Promise<GoogleResult> {
    let nonce = randomHex(GOOGLE_NONCE_SIZE)
    let state = randomHex(GOOGLE_STATE_SIZE)

    let wellKnown = await googleWellKnown()

    let url = makeUrlWithParams(wellKnown.authorization_endpoint, {
        scope: GOOGLE_SCOPE,
        response_type: GOOGLE_RESPONSE_TYPE,
        client_id: googleCredentials.client_id,
        redirect_uri: googleCredentials.redirect_url,
        nonce: nonce,
        state: state,
        prompt: "consent"
    })

    return new Promise<GoogleResult>((resolve, reject) => {
        let callback = (e: MessageEvent<GooglePageResponse>) => {
            console.log("google: page response success", e.data.success)

            if (!e.data.success) {
                console.warn("google: unsuccessful attempt")

                reject()
                return
            }

            if (e.data.state !== state) {
                console.warn("google: wrong state")

                reject()
                return
            }

            resolve({
                nonce: nonce,
                idtoken: e.data.idtoken,
            })
        }

        window.addEventListener("message", callback, {once: true})

        let googleWindow = window.open(url.toString(), PAGE_NAME, PAGE_SETTINGS)

        // Checking if window was closed
        let timer = setInterval(() => {
            if (googleWindow.closed) {
                clearInterval(timer)

                // Callback will be triggered before window closed
                window.removeEventListener("message", callback)

                // reject() after resolve() would have no effect
                reject()

                console.log("google: window closed")
            }
        }, PAGE_CLOSE_PING)

        console.log("google: opening page", url.toString())
    })
}

interface WellKnown {
    authorization_endpoint: string
}

async function googleWellKnown(): Promise<WellKnown> {
    let response = await fetch(GOOGLE_WELL_KNOWN)

    return await response.json()
}

export function googleSignIn(): AppThunkAction {
    return async function (dispatch) {
        dispatch(authActions.signInProcess({
            type: Type.GOOGLE
        }))

        let authResult: GoogleResult
        try {
            authResult = await googleAuth()
        } catch (e) {
            dispatch(authActions.signInFailed())
        }

        try {
            let signInResult = await methods.googleSignIn({
                nonce: authResult.nonce,
                idtoken: authResult.idtoken
            })

            // Saving token
            setToken(signInResult.user_token)

            // Authenticating globally
            dispatch(userActions.auth({user: signInResult.user}))

            console.log("google: signed in as", signInResult.user.nickname)
        } catch (err) {
            // If user not found, going to signUp
            if (err.code == ERR_USER_NOT_FOUND) {
                dispatch(authActions.signUp({
                    nonce: authResult.nonce,
                    idtoken: authResult.idtoken
                }))

                return
            }

            dispatch(authActions.signInFailed())
        }
    }
}

export function googleSignUp(nonce: string, idToken: string, nickname: string): AppThunkAction {
    return async function (dispatch) {
        dispatch(authActions.signUpProcess())

        await timeout(1000)

        try {
            let signUpResult = await methods.googleSignUp({
                nonce: nonce,
                idtoken: idToken,
                nickname: nickname
            })

            // Saving token
            setToken(signUpResult.user_token)

            // Authenticating globally
            dispatch(userActions.auth({user: signUpResult.user}))

            console.log("google: signed up as", signUpResult.user.nickname)
        } catch (err) {
            let validationError = false

            if (err.code == ERR_BAD_REQUEST) {
                validationError = true
            }

            dispatch(authActions.signUpFailed({validationError}))
        }
    }
}
