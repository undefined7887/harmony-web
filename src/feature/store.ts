import {AnyAction, configureStore, ThunkAction} from "@reduxjs/toolkit"

import {reducer as authReducer} from "src/feature/auth/slice";

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunkAction<Return = void> = ThunkAction<Return, AppState, unknown, AnyAction>