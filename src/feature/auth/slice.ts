import {createSlice, PayloadAction} from "@reduxjs/toolkit"

export enum Type {
    GOOGLE
}

export interface State {
    step: Step
    type?: Type
    nonce?: string
    idtoken?: string
    validationError?: boolean
    token?: string
}

export enum Step {
    SIGN_IN,
    SIGN_IN_PROCESS,
    SIGN_IN_FAILED,
    SIGN_UP,
    SIGN_UP_PROCESS,
    SIGN_UP_FAILED,
    SUCCESS
}

export interface SignInPayload {
    type: Type
}

export interface SignUpPayload {
    nonce: string
    idtoken: string
}

export interface ErrorPayload {
    validationError: boolean
}

export interface SuccessPayload {
    token: string
}


const initialState: State = {step: Step.SIGN_IN}

export const slice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        signIn(state) {
            state.step = Step.SIGN_IN
        },

        signInProcess(state, action: PayloadAction<SignInPayload>) {
            state.step = Step.SIGN_IN_PROCESS

            state.type = action.payload.type
        },

        signInFailed(state) {
            state.step = Step.SIGN_IN_FAILED
        },

        signUp(state, action: PayloadAction<SignUpPayload>) {
            state.step = Step.SIGN_UP

            state.nonce = action.payload.nonce
            state.idtoken = action.payload.idtoken
        },

        signUpProcess(state) {
            state.step = Step.SIGN_UP_PROCESS
        },

        signUpFailed(state, action: PayloadAction<ErrorPayload>) {
            state.step = Step.SIGN_UP_FAILED

            state.validationError = action.payload.validationError
        },

        success(state, action: PayloadAction<SuccessPayload>) {
            state.step = Step.SUCCESS
            state.token = action.payload.token
        }
    }
})

export const actions = slice.actions
export const reducer = slice.reducer
