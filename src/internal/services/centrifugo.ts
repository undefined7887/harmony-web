import {createSlice} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {Centrifuge, PublicationContext, State} from "centrifuge";

import config from "config/config.json"
import {Chat, ChatActions, TYPING_CHECK_TIMEOUT} from "src/internal/services/chat";
import {ChatReadUpdateNotification, ChatType, ChatTypingUpdateNotification, MessageModel} from "src/internal/api/chat";
import {AuthActions} from "src/internal/services/auth";
import {User, UserActions} from "src/internal/services/user";
import {UserModel} from "src/internal/api/user";
import {timeout} from "src/internal/utils/common";
import {API_TIMEOUT} from "src/internal/api/common";

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

            await timeout(API_TIMEOUT)
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

            CentrifugoManager.subscribe(
                `chat:message/new#${authState.userId}`,
                CentrifugoManager.onChatNewMessage(dispatch, getState)
            )

            CentrifugoManager.subscribe(
                `chat:read/updates#${authState.userId}`,
                CentrifugoManager.onChatReadUpdates(dispatch, getState)
            )

            CentrifugoManager.subscribe(
                `chat:typing/updates#${authState.userId}`,
                CentrifugoManager.onChatTypingUpdates(dispatch, getState)
            )

            CentrifugoManager.connection.connect()
        }
    }

    static subscribeUser(id: string): AppThunkAction {
        return async function (dispatch) {
            CentrifugoManager.subscribe(`user:${id}`, CentrifugoManager.onUserUpdate(dispatch))
        }
    }

    private static subscribe(channel: string, callback: (PublicationContext) => void) {
        let subscription = CentrifugoManager.connection.newSubscription(channel)

        subscription.on("subscribed", () => {
            console.log("centrifugo: subscribed to", channel)
        })

        subscription.on("publication", ctx => {
            console.log("centrifugo: publication on channel", channel)
            callback(ctx)
        })

        try {
            subscription.subscribe()
        } catch (err) {
            console.log("centrifugo: subscription: error", err)
        }
    }

    private static onUserUpdate(dispatch): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            let user = ctx.data as UserModel

            dispatch(UserActions.load({id: user.id, user}))
        }
    }

    private static onChatNewMessage(dispatch, getState): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            let message = ctx.data as MessageModel

            let authState = getState().auth
            let chatState = getState().chat

            console.log("centrifugo: chat: new message", message.id)

            switch (message.peer_type) {
                case ChatType.USER:
                    let chatId = message.user_id == authState.userId ? message.peer_id : message.user_id

                    if (chatState.chats.findIndex(chat => chat.id == chatId) < 0) {
                        // Chat not found, creating new chat
                        dispatch(ChatActions.newChat({
                            chat: {
                                id: chatId,
                                type: ChatType.USER,
                                message: message,
                                unread_count: 0
                            }
                        }))
                    }

                    dispatch(ChatActions.newMessage({
                        chatId,
                        message,

                        // Updating unread count in case message isn't sent by current user
                        update_unread_count: message.user_id != authState.userId
                    }))

                    if (message.user_id != authState.userId) {
                        dispatch(ChatActions.updateChatTyping({chatId: chatId, userId: message.user_id, typing: false}))
                    }

                    break
            }
        }
    }

    private static onChatReadUpdates(dispatch, getState): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            let notification = ctx.data as ChatReadUpdateNotification
            let authState = getState().auth

            let chatId = notification.peer_id == authState.userId ? notification.user_id : notification.peer_id
            console.log("centrifugo: chat: read update", chatId)

            dispatch(ChatActions.updateChatRead({chatId, userId: notification.user_id}))
        }
    }

    private static onChatTypingUpdates(dispatch, getState): (PublicationContext) => void {
        return async function (ctx: PublicationContext) {
            let notification = ctx.data as ChatTypingUpdateNotification
            let authState = getState().auth

            let chatId = notification.peer_id == authState.userId ? notification.user_id : notification.peer_id
            console.log("centrifugo: chat: typing update", chatId)

            dispatch(ChatActions.updateChatTyping({
                chatId,
                userId: notification.user_id,
                typing: notification.typing
            }))

            setTimeout(() => {
                dispatch(ChatActions.updateChatTypingCheck({
                    chatId,
                    userId: notification.user_id,
                    typing: false
                }))
            }, TYPING_CHECK_TIMEOUT)
        }
    }
}