import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {ChatApi, ChatErrors, ChatModel, ChatType, MessageModel} from "src/internal/api/chat";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";
import {AuthState, AuthStep} from "src/internal/services/auth";

export interface ChatState {
    chats: ChatModel[]
    currentChat?: ChatModel
    messages: { [id: string]: MessageModel[] }
}

export interface ChatListPayload {
    chats: ChatModel[]
}

export interface ChatChoosePayload {
    chat: ChatModel
}

export interface ChatListMessagesPayload {
    chatId: string
    messages: MessageModel[]
}

export interface ChatNewPayload {
    chat: ChatModel
}

export interface ChatNewMessagePayload {
    chatId: string
    message: MessageModel
    update_unread_count: boolean
}

export interface ChatUpdateReadPayload {
    chatId: string
    userId: string
}

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: {}
    } as ChatState,
    reducers: {
        reset(state) {
            console.log("chat: reset")

            return {messages: {}} as ChatState
        },

        listChats(state, action: PayloadAction<ChatListPayload>) {
            state.chats = action.payload.chats
        },

        newChat(state, action: PayloadAction<ChatNewPayload>) {
            state.chats.unshift(action.payload.chat)
        },

        listMessages(state, action: PayloadAction<ChatListMessagesPayload>) {
            state.messages[action.payload.chatId] = action.payload.messages
        },

        newMessage(state, action: PayloadAction<ChatNewMessagePayload>) {
            // Appending message if they are loaded
            state.messages[action.payload.chatId]?.unshift(action.payload.message)

            // Finding chat for message
            let chat = state.chats
                .find(chat => chat.id == action.payload.chatId)

            // Updating chat's last message
            chat.message = action.payload.message

            if (action.payload.update_unread_count) {
                chat.unread_count += 1
            }
        },

        updateChatRead(state, action: PayloadAction<ChatUpdateReadPayload>) {
            state.messages[action.payload.chatId].forEach(message => {
                message.read_user_ids.push(action.payload.userId)
            })

            // Finding chat for message
            let chat = state.chats
                .find(chat => chat.id == action.payload.chatId)

            chat.unread_count = 0
        },

        setCurrentChat(state, action: PayloadAction<ChatChoosePayload>) {
            console.log("chat: current chat", action.payload.chat)

            state.currentChat = action.payload.chat
        }
    }
})

export const ChatActions = chatSlice.actions

export const chatReducer = chatSlice.reducer

export class Chat {
    static listChats(): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: loading chats")

            try {
                let listChatsResponse = await ChatApi.listChats()

                dispatch(ChatActions.listChats({chats: listChatsResponse.items}))

                console.log("chat: loaded chats")
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND) {
                    dispatch(ChatActions.listChats({chats: []}))

                    return
                }
            }
        }
    }

    static listMessages(peerId: string, peerType: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: loading messages")

            try {
                let listMessagesResponse = await ChatApi.listMessages(peerId, peerType)

                dispatch(ChatActions.listMessages({chatId: peerId, messages: listMessagesResponse.items}))

                console.log("chat: loaded messages")
            } catch (err) {
                if (err.code == ChatErrors.ERR_MESSAGE_NOT_FOUND) {
                    dispatch(ChatActions.listMessages({chatId: peerId, messages: []}))

                    return
                }
            }
        }
    }

    static createMessage(peerId: string, peerType: string, text: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: sending message")

            try {
                await ChatApi.createMessage(peerId, peerType, text)
            } catch (e) {
                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.createMessage(peerId, peerType, text))
            }
        }
    }

    static newMessage(message: MessageModel): AppThunkAction {
        return async function (dispatch, getState) {
            let authState = getState().auth
            let chatState = getState().chat

            switch (message.peer_type) {
                case ChatType.USER:
                    let chatId = message.user_id == authState.user.id ? message.peer_id : message.user_id

                    if (chatState.chats.findIndex(chat => chat.id == chatId) < 0) {
                        // Chat not found, creating new chat
                        dispatch(ChatActions.newChat({
                            chat: {
                                id: chatId,
                                type: ChatType.USER,
                                message: message,
                                unread_count: 1
                            }
                        }))
                    }

                    dispatch(ChatActions.newMessage({
                        chatId,
                        message,

                        // Updating unread count in case message isn't sent by current user
                        update_unread_count: message.user_id != authState.user.id
                    }))

                    break
            }
        }
    }

    static updateChatRead(peerId: string, peerType: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: updating read")

            try {
                await ChatApi.updateChatRead(peerId, peerType)
            } catch (err) {
                if (err.code == ChatErrors.ERR_MESSAGE_NOT_FOUND) {
                    return
                }

                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.updateChatRead(peerId, peerType))
            }
        }
    }

    static chatReadUpdates(peerId: string, userId: string): AppThunkAction {
        return async function (dispatch, getState) {
            let authState = getState().auth

            let chatId = userId == authState.user.id ? peerId : userId
            console.log("chat: updating read for", chatId)

            // peerId will be always current user
            dispatch(ChatActions.updateChatRead({chatId, userId}))
        }
    }
}
