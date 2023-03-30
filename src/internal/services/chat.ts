import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {ChatApi, ChatErrors, ChatModel, ChatType, MessageModel} from "src/internal/api/chat";
import {timeout} from "src/internal/utils/common";
import {CommonErrors, RETRY_TIMEOUT} from "src/internal/api/common";

export const TYPING_TIMEOUT = 2_000
export const TYPING_CHECK_TIMEOUT = 5_000

export interface ChatState {
    chats: ChatModel[]
    messages: { [id: string]: MessageModel[] }
    currentId?: string
    currentType?: ChatType
    typing: { [id: string]: { userId: string, lastUpdated: number }[] }
}

export interface ChatListPayload {
    chats: ChatModel[]
}

export interface ChatChoosePayload {
    chatId: string
    chatType?: ChatType
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
            state.messages[action.payload.chatId]?.unshift(action.payload.message)

            let chat = state.chats.find(chat => chat.id == action.payload.chatId)
            chat.message = action.payload.message

            if (action.payload.update_unread_count) {
                chat.unread_count += 1
            }

            // Moving chat to the top
            state.chats.splice(state.chats.findIndex(chat => chat.id == action.payload.chatId), 1)
            state.chats.unshift(chat)
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
            if (!state.typing[action.payload.chatId]) {
                state.typing[action.payload.chatId] = []
            }

            let now = new Date().getTime()

            let idx = state.typing[action.payload.chatId].findIndex(typing => {
                return typing.userId == action.payload.userId
            })

            if (action.payload.typing && idx < 0) {
                state.typing[action.payload.chatId].push({
                    userId: action.payload.userId,
                    lastUpdated: now
                })
            } else if (action.payload.typing) {
                state.typing[action.payload.chatId][idx].lastUpdated = now
            } else if (idx >= 0) {
                state.typing[action.payload.chatId].splice(idx, 1)
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

            if (idx >= 0 && (now - state.typing[action.payload.chatId][idx].lastUpdated) > TYPING_TIMEOUT) {
                state.typing[action.payload.chatId].splice(idx, 1)
            }
        },

        setCurrentChat(state, action: PayloadAction<ChatChoosePayload>) {
            state.currentId = action.payload.chatId
            state.currentType = action.payload.chatType
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

                dispatch(ChatActions.listChats({
                    chats: listChatsResponse.items
                }))

                console.log("chat: loaded chats")
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND) {
                    dispatch(ChatActions.listChats({chats: []}))

                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("chat: retrying loading chats")

                    await timeout(RETRY_TIMEOUT)
                    dispatch(Chat.listChats)
                }
            }
        }
    }

    static listMessages(peerId: string, peerType: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: loading messages")

            try {
                let listMessagesResponse = await ChatApi.listMessages(peerId, peerType)

                dispatch(ChatActions.listMessages({
                    chatId: peerId,
                    messages: listMessagesResponse.items
                }))

                console.log("chat: loaded messages")
            } catch (err) {
                if (err.code == ChatErrors.ERR_MESSAGE_NOT_FOUND) {
                    dispatch(ChatActions.listMessages({chatId: peerId, messages: []}))

                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("chat: retrying loading messages")

                    await timeout(RETRY_TIMEOUT)
                    dispatch(Chat.listMessages(peerId, peerType))
                }
            }
        }
    }

    static createMessage(peerId: string, peerType: string, text: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: sending message")

            try {
                await ChatApi.createMessage(peerId, peerType, text)
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("chat: retrying sending message")

                    await timeout(RETRY_TIMEOUT)
                    dispatch(Chat.createMessage(peerId, peerType, text))
                }
            }
        }
    }

    static updateChatRead(peerId: string, peerType: string): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: updating read")

            try {
                await ChatApi.updateChatRead(peerId, peerType)
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND || err.code == ChatErrors.ERR_MESSAGE_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("chat: retrying update read")

                    await timeout(RETRY_TIMEOUT)
                    dispatch(Chat.updateChatRead(peerId, peerType))
                }
            }
        }
    }

    static updateChatTyping(peerId: string, peerType: string, typing: boolean): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: updating typing")

            try {
                await ChatApi.updateChatTyping(peerId, peerType, typing)
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("chat: retrying update typing")

                    await timeout(RETRY_TIMEOUT)
                    dispatch(Chat.updateChatTyping(peerId, peerType, typing))
                }
            }
        }
    }
}
