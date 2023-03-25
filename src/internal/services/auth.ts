import googleCredentials from "secrets/google_credentials.json";
import {JwtStandardClaims, setJwtCookie} from "src/internal/utils/token";
import {randomHex} from "src/internal/utils/crypto";
import {makeUrlWithQueryParams} from "src/internal/utils/http";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {AuthApi} from "src/internal/api/auth";
import {UserModel, UserApi, UserErrors} from "src/internal/api/user";
import {CommonErrors, RETRY_TIMEOUT} from "src/internal/api/common";
import {timeout} from "src/internal/utils/common";
import {UserActions} from "src/internal/services/user";

interface OAuthWindowResponse {
    success: boolean
    state?: string
    idtoken?: string
}

interface OAuthResult {
    nonce: string
    idtoken: string
}

export class OAuth {
    static NONCE_SIZE = 16
    static STATE_SIZE = 16
    static RESPONSE_TYPE = "id_token"

    static WINDOW_TIMEOUT = 500
    static WINDOW_TITLE = "Sign in"
    static WINDOW_SETTINGS = "scrollbars=no,resizable=no,left=100,top=100,width=500,height=700"

    private static window: Window = null;

    static auth(url: string, nonce: string, state: string): Promise<OAuthResult> {
        return new Promise<OAuthResult>((resolve, reject) => {
            if (OAuth.window != null && !OAuth.window.closed) {
                // Window already opened, reject immediately
                reject()

                return
            }

            let callback = (response: OAuthWindowResponse) => {
                console.log("oauth2: window response", response.success ? "ok" : "err")

                if (!response.success) {
                    reject()
                    return
                }

                if (response.state !== state) {
                    console.warn("oauth2: state malformed")

                    reject()
                    return
                }

                resolve({
                    nonce: nonce,
                    idtoken: response.idtoken,
                })
            }

            OAuth.openWindow(url, callback)
        })
    }

    static sendWindowResponse(response: OAuthWindowResponse) {
        window.opener.postMessage(response)
    }

    private static openWindow(url: string, callback: (OAuthWindowResponse) => void) {
        console.log("oauth2: opening window", url.toString())

        let messageCallback = (e: MessageEvent<OAuthWindowResponse>) => {
            callback(e.data)

            // Listener no more required after sending callback
            window.removeEventListener("message", messageCallback)
        }

        window.addEventListener("message", messageCallback)

        // Opening window after registering message callback
        OAuth.window = window.open(url.toString(), OAuth.WINDOW_TITLE, OAuth.WINDOW_SETTINGS)

        // Monitoring window liveliness
        let closeTimer = setInterval(
            () => {
                if (OAuth.window.closed) {
                    clearInterval(closeTimer)

                    callback({success: false})

                    // Listener no more required after sending callback
                    window.removeEventListener("message", messageCallback)
                }
            },
            OAuth.WINDOW_TIMEOUT
        )
    }
}

interface GoogleWellKnown {
    authorization_endpoint: string
}

export interface GoogleClaims extends JwtStandardClaims {
    picture: string
    email: string
    email_verified: boolean
}

class GoogleOAuth {
    static WELL_KNOWN_ADDRESS = "https://accounts.google.com/.well-known/openid-configuration"
    static SCOPE = "openid profile email"
    static PROMPT = "consent"

    static async getWellKnown(): Promise<GoogleWellKnown> {
        let response = await fetch(GoogleOAuth.WELL_KNOWN_ADDRESS)

        return await response.json()
    }

    static async auth(): Promise<OAuthResult> {
        let nonce = randomHex(OAuth.NONCE_SIZE)
        let state = randomHex(OAuth.STATE_SIZE)

        let wellKnown = await GoogleOAuth.getWellKnown()

        let url = makeUrlWithQueryParams(wellKnown.authorization_endpoint, {
            scope: GoogleOAuth.SCOPE,
            response_type: OAuth.RESPONSE_TYPE,
            client_id: googleCredentials.clientId,
            redirect_uri: googleCredentials.redirectUrl,
            nonce: nonce,
            state: state,
            prompt: GoogleOAuth.PROMPT
        })

        return await OAuth.auth(url, nonce, state)
    }
}


export enum AuthType {
    GOOGLE
}

export enum AuthStep {
    INIT,
    SIGN_IN,
    SIGN_IN_PROCESS,
    SIGN_IN_FAILED,
    SIGN_UP,
    SIGN_UP_PROCESS,
    SIGN_UP_FAILED,
    OK
}

export interface AuthState {
    step: AuthStep
    userId?: string
    type?: AuthType
    nonce?: string
    idtoken?: string
    validationError?: boolean
}

export interface AuthSignInPayload {
    type: AuthType
}

export interface AuthSignUpPayload {
    nonce: string
    idtoken: string
}

export interface AuthErrorPayload {
    validationError: boolean
}

export interface AuthPayload {
    userId: string
}

const AuthSlice = createSlice({
    name: "auth",
    initialState: {
        step: AuthStep.INIT
    } as AuthState,
    reducers: {
        reset(state) {
            console.log("auth: reset")

            return {step: AuthStep.INIT} as AuthState
        },

        signIn(state) {
            state.step = AuthStep.SIGN_IN
        },

        signInProcess(state, action: PayloadAction<AuthSignInPayload>) {
            state.step = AuthStep.SIGN_IN_PROCESS

            state.type = action.payload.type
        },

        signInFailed(state, action?: PayloadAction<AuthErrorPayload>) {
            state.step = AuthStep.SIGN_IN_FAILED
        },

        signUp(state, action: PayloadAction<AuthSignUpPayload>) {
            state.step = AuthStep.SIGN_UP

            state.nonce = action.payload.nonce
            state.idtoken = action.payload.idtoken
        },

        signUpProcess(state) {
            state.step = AuthStep.SIGN_UP_PROCESS
        },

        signUpFailed(state, action: PayloadAction<AuthErrorPayload>) {
            state.step = AuthStep.SIGN_UP_FAILED

            state.validationError = action.payload.validationError
        },

        auth(state, action: PayloadAction<AuthPayload>) {
            state.step = AuthStep.OK

            state.userId = action.payload.userId
        },

        logout(state) {
            state.step = AuthStep.SIGN_IN
        }
    }
})

export const AuthActions = AuthSlice.actions

export const authReducer = AuthSlice.reducer

export class Auth {
    static testAuth(): AppThunkAction {
        return async function (dispatch) {
            console.log("auth: testing authentication")

            await timeout(500);

            try {
                let user = await UserApi.getSelf()

                dispatch(UserActions.load({id: user.id, user}))
                dispatch(AuthActions.auth({userId: user.id}))

                console.log("auth: signed in as", user.nickname)
            } catch (err) {
                if (err.code == CommonErrors.ERR_UNAUTHORIZED) {
                    dispatch(AuthActions.logout())

                    return
                }

                console.warn("auth: retrying authentication test")

                await timeout(RETRY_TIMEOUT)
                dispatch(Auth.testAuth())
            }
        }
    }

    static googleSignIn(): AppThunkAction {
        return async function (dispatch) {
            dispatch(AuthActions.signInProcess({type: AuthType.GOOGLE}))

            let authResult: OAuthResult
            try {
                authResult = await GoogleOAuth.auth()
            } catch (e) {
                dispatch(AuthActions.signInFailed())
            }

            try {
                let signInResult = await AuthApi.googleSignIn({
                    nonce: authResult.nonce,
                    idtoken: authResult.idtoken
                })

                // Saving token
                setJwtCookie(signInResult.user_token)

                // Authenticating globally
                dispatch(UserActions.load({id: signInResult.user.id, user: signInResult.user}))
                dispatch(AuthActions.auth({userId: signInResult.user.id}))

                console.log("auth: signed in as", signInResult.user.nickname)
            } catch (err) {
                // If user not found, going to signUp
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    dispatch(AuthActions.signUp({
                        nonce: authResult.nonce,
                        idtoken: authResult.idtoken
                    }))

                    return
                }

                dispatch(AuthActions.signInFailed())
            }
        }
    }

    static googleSignUp(nonce: string, idToken: string, nickname: string): AppThunkAction {
        return async function (dispatch) {
            dispatch(AuthActions.signUpProcess())

            try {
                let signUpResult = await AuthApi.googleSignUp({
                    nonce: nonce,
                    idtoken: idToken,
                    nickname: nickname
                })

                // Saving token
                setJwtCookie(signUpResult.user_token)

                // Authenticating globally
                dispatch(UserActions.load({id: signUpResult.user.id, user: signUpResult.user}))
                dispatch(AuthActions.auth({userId: signUpResult.user.id}))

                console.log("auth: signed up as", signUpResult.user.nickname)
            } catch (err) {
                let validationError = false

                if (err.code == CommonErrors.ERR_BAD_REQUEST) {
                    validationError = true
                }

                dispatch(AuthActions.signUpFailed({validationError}))
            }
        }
    }
}
