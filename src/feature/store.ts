import {AnyAction, configureStore, ThunkAction} from "@reduxjs/toolkit"

import {reducer as authReducer} from "src/feature/auth/slice";
import {reducer as userReducer} from "src/feature/user/slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer
    }
})

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunkAction<Return = void> = ThunkAction<Return, AppState, unknown, AnyAction>