import {createSlice} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {Centrifuge, PublicationContext, State} from "centrifuge";

import config from "config/config.json"
import {Chat, ChatActions} from "src/internal/services/chat";
import {MessageModel} from "src/internal/api/chat";
import {AuthActions} from "src/internal/services/auth";
import {User, UserActions} from "src/internal/services/user";
import {UserModel} from "src/internal/api/user";

export interface CentrifugoState {
    connected: boolean
}

const centrifugoSlice = createSlice({
    name: "centrifugo",
    initialState: {
        connected: false
    } as CentrifugoState,
    reducers: {
        connect(state) {
            state.connected = true
        },

        disconnect(state) {
            state.connected = false
        },
    }
})

export const CentrifugoActions = centrifugoSlice.actions
export const centrifugoReducer = centrifugoSlice.reducer

export class CentrifugoManager {
    private static connection: Centrifuge

    static connect(): AppThunkAction {
        return async function (dispatch, getState) {
            let authState = getState().auth

            CentrifugoManager.connection = new Centrifuge(config.addresses.centrifugo)

            CentrifugoManager.connection.once("connected", () => {
                console.log("centrifugo: connected")
                dispatch(CentrifugoActions.connect())
            })

            CentrifugoManager.connection.once("disconnected", () => {
                console.log("centrifugo: disconnected")

                dispatch(CentrifugoActions.disconnect())
                dispatch(AuthActions.reset())
                dispatch(UserActions.reset())
                dispatch(ChatActions.reset())
            })

            CentrifugoManager.connection.on("state", ctx => {
                // Detecting reconnect
                if (ctx.oldState == State.Connected && ctx.newState == State.Connecting) {
                    console.log("centrifugo: state changed from 'connected' to 'connecting', triggering disconnect")

                    CentrifugoManager.connection.disconnect()
                }
            })

            CentrifugoManager
                .subscribe(`chat:message/new#${authState.user.id}`, CentrifugoManager.onChatNewMessage(dispatch))

            CentrifugoManager
                .subscribe(`chat:read/updates#${authState.user.id}`, CentrifugoManager.onChatReadUpdates(dispatch))

            CentrifugoManager.connection.connect()
        }
    }

    static subscribeUser(id: string): AppThunkAction {
        return async function (dispatch) {
            CentrifugoManager
                .subscribe(`user:${id}`, CentrifugoManager.onUserUpdate(dispatch))
        }
    }

    private static subscribe(channel: string, callback: (PublicationContext) => void) {
        let subscription = CentrifugoManager.connection.newSubscription(channel)

        subscription.on("subscribed", () => {
            console.log("centrifugo: subscribed to", channel)
        })

        subscription.on("publication", ctx => {
            console.log("centrifugo: publication on channel", channel, ctx.data)
            callback(ctx)
        })

        subscription.subscribe()
    }

    private static onChatNewMessage(dispatch): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            dispatch(Chat.newMessage(ctx.data as MessageModel))
        }
    }

    private static onChatReadUpdates(dispatch): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            dispatch(Chat.chatReadUpdates(ctx.data.peer_id, ctx.data.user_id))
        }
    }

    private static onUserUpdate(dispatch): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            dispatch(User.update(ctx.data as UserModel))
        }
    }
}