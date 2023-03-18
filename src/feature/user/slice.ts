import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {User} from "src/feature/user/api";

export enum Auth {
    UNKNOWN,
    UNAUTHORIZED,
    AUTHORIZED
}

export interface State {
    auth: Auth
    user?: User
}

export interface AuthenticatePayload {
    user?: User
}

const initialState: State = {auth: Auth.UNKNOWN}

const slice = createSlice({
    name: "user",
    initialState: initialState,
    reducers: {
        auth(state, action: PayloadAction<AuthenticatePayload>) {
            state.auth = Auth.AUTHORIZED
            state.user = action.payload.user
        },

        logout(state) {
            state.auth = Auth.UNAUTHORIZED
        }
    }
})

export const actions = slice.actions;

export const reducer = slice.reducer;

