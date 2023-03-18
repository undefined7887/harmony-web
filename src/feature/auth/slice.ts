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
}

export enum Step {
    INIT,
    SIGN_IN,
    SIGN_IN_PROCESS,
    SIGN_IN_FAILED,
    SIGN_UP,
    SIGN_UP_PROCESS,
    SIGN_UP_FAILED,
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

const initialState: State = {step: Step.INIT}

const slice = createSlice({
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
    }
})

export const actions = slice.actions
export const reducer = slice.reducer
