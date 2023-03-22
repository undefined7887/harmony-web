import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {ChatApi, ChatErrors, ChatModel, MessageModel} from "src/internal/api/chat";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";

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

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        messages: {}
    } as ChatState,
    reducers: {
        listChats(state, action: PayloadAction<ChatListPayload>) {
            state.chats = action.payload.chats
        },

        listMessages(state, action: PayloadAction<ChatListMessagesPayload>) {
            state.messages[action.payload.chatId] = action.payload.messages
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

                console.warn("chat: retrying chat loading")

                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.listChats())
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

                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.listMessages(peerId, peerType))
            }
        }
    }
}
