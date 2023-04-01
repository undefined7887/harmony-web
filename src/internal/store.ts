import {configureStore, ThunkAction, AnyAction} from "@reduxjs/toolkit"

import {authReducer} from "src/internal/services/auth";
import {userReducer} from "src/internal/services/user";
import {chatReducer} from "src/internal/services/chat";
import {callReducer} from "src/internal/services/call";
import {centrifugoReducer} from "src/internal/services/centrifugo";

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunkAction<Return = void> = ThunkAction<Return, AppState, unknown, AnyAction>

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        chat: chatReducer,
        call: callReducer,
        centrifugo: centrifugoReducer,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: false
    })
})

