import {makeRequest, METHOD_POST} from "src/feature/api";

export const ERR_WRONG_GOOGLE_TOKEN = 201
export const ERR_EMAIL_NOT_VERIFIED = 202

export interface SignInRequest {
    nonce: string
    idtoken: string
}

export interface SignUpRequest {
    nonce: string,
    idtoken: string
    nickname: string
}

export interface AuthResponse {
    user_id: string
    user_token: string
}

async function googleSignIn(data: SignInRequest): Promise<AuthResponse> {
    return await makeRequest<SignInRequest, AuthResponse>(METHOD_POST, "/api/v1/auth/google/sign_in", data)
}

async function googleSignUp(data: SignUpRequest): Promise<AuthResponse> {
    return await makeRequest<SignUpRequest, AuthResponse>(METHOD_POST, "/api/v1/auth/google/sign_up", data)
}

export const methods = {
    googleSignIn,
    googleSignUp
}
