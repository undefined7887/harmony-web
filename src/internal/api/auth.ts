import {UserModel} from "src/internal/api/user";
import {HttpMethods, makeHttpRequest} from "src/internal/api/common";

export class AuthErrors {
    static ERR_WRONG_GOOGLE_TOKEN = 201
    static ERR_EMAIL_NOT_VERIFIED = 202
}

export interface GoogleSignInRequest {
    nonce: string
    idtoken: string
}

export interface GoogleSignUpRequest {
    nonce: string,
    idtoken: string
    nickname: string
}

export interface AuthResponse {
    user: UserModel
    user_token: string
}

export class AuthApi {
    static async googleSignIn(data: GoogleSignInRequest): Promise<AuthResponse> {
        return await makeHttpRequest<GoogleSignInRequest, AuthResponse>(HttpMethods.POST, "/api/v1/auth/google/sign_in", data)
    }

    static async googleSignUp(data: GoogleSignUpRequest): Promise<AuthResponse> {
        return await makeHttpRequest<GoogleSignUpRequest, AuthResponse>(HttpMethods.POST, "/api/v1/auth/google/sign_up", data)
    }
}
