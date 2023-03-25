import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {ChatApi, ChatErrors, ChatModel, ChatType, MessageModel} from "src/internal/api/chat";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";

export const TYPING_TIMEOUT = 2_000
export const TYPING_CHECK_TIMEOUT = 5_000

export interface ChatState {
    chats: ChatModel[]
    typing: { [id: string]: { userId: string, lastUpdated: number }[] }
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

export interface ChatUpdateTypingPayload {
    chatId: string
    userId: string
    typing: boolean
}

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        typing: {},
        messages: {}
    } as ChatState,
    reducers: {
        reset(state) {
            console.log("chat: reset")

            return {typing: {}, messages: {}} as ChatState
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

        updateChatTyping(state, action: PayloadAction<ChatUpdateTypingPayload>) {
            console.log("chat: updating chat typing")

            if (!state.typing[action.payload.chatId]) {
                state.typing[action.payload.chatId] = []
            }

            let now = new Date().getTime()

            if (action.payload.typing) {
                state.typing[action.payload.chatId].push({
                    userId: action.payload.userId,
                    lastUpdated: now
                })
            } else {
                let idx = state.typing[action.payload.chatId].findIndex(typing => {
                    return typing.userId == action.payload.userId
                })

                if (idx >= 0) {
                    state.typing[action.payload.chatId].splice(idx, 1)
                }
            }
        },

        updateChatTypingCheck(state, action: PayloadAction<ChatUpdateTypingPayload>) {
            if (!state.typing[action.payload.chatId]) {
                return
            }

            let idx = state.typing[action.payload.chatId].findIndex(typing => {
                return typing.userId == action.payload.userId
            })

            let now = new Date().getTime()

            if (idx >= 0 && Math.abs(now - state.typing[action.payload.chatId][idx].lastUpdated) > TYPING_TIMEOUT) {
                state.typing[action.payload.chatId].splice(idx, 1)
            }
        },

        setCurrentChat(state, action: PayloadAction<ChatChoosePayload>) {
            console.log("chat: current chat", action.payload.chat)

            state.currentChat = action.payload.chat
        },
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

    static updateChatTyping(peerId: string, peerType: string, typing: boolean): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: updating typing")

            try {
                await ChatApi.updateChatTyping(peerId, peerType, typing)
            } catch (err) {
                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.updateChatTyping(peerId, peerType, typing))
            }
        }
    }

    static newMessage(message: MessageModel): AppThunkAction {
        return async function (dispatch, getState) {
            let authState = getState().auth
            let chatState = getState().chat

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

    static chatReadUpdates(peerId: string, userId: string): AppThunkAction {
        return async function (dispatch, getState) {
            let authState = getState().auth

            let chatId = userId == authState.userId ? peerId : userId
            console.log("chat: updating read for", chatId)

            // peerId will be always current user
            dispatch(ChatActions.updateChatRead({chatId, userId}))
        }
    }

    static chatTypingUpdates(peerId: string, userId: string, typing: boolean): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: updating typing for", peerId, "set", typing)

            // peerId will be always current user
            dispatch(ChatActions.updateChatTyping({chatId: userId, userId, typing: typing}))

            setTimeout(() => {
                dispatch(ChatActions.updateChatTypingCheck({chatId: userId, userId, typing: false}))
            }, TYPING_CHECK_TIMEOUT)
        }
    }
}
