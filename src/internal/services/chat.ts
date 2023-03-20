import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {ChatApi, ChatErrors, ChatModel} from "src/internal/api/chat";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";

export interface ChatState {
    chats: ChatModel[]
    currentChat?: ChatModel
}

export interface ChatLoadingDonePayload {
    chats: ChatModel[]
}

export interface ChatChoosePayload {
    chat: ChatModel
}

const chatSlice = createSlice({
    name: "chat",
    initialState: {} as ChatState,
    reducers: {
        list(state, action: PayloadAction<ChatLoadingDonePayload>) {
            state.chats = action.payload.chats
        },

        setCurrent(state, action: PayloadAction<ChatChoosePayload>) {
            console.log("chat: current chat", action.payload.chat)

            state.currentChat = action.payload.chat
        }
    }
})

export const ChatActions = chatSlice.actions

export const chatReducer = chatSlice.reducer

export class Chat {
    static list(): AppThunkAction {
        return async function (dispatch) {
            console.log("chat: loading chats")

            try {
                let listChatsResponse = await ChatApi.listChats()

                dispatch(ChatActions.list({chats: listChatsResponse.items}))

                console.log("chat: loaded chats")
            } catch (err) {
                if (err.code == ChatErrors.ERR_CHATS_NOT_FOUND) {
                    // No chats found
                    dispatch(ChatActions.list({chats: []}))

                    return
                }

                console.warn("chat: retrying chat loading")

                await timeout(RETRY_TIMEOUT)
                dispatch(Chat.list())
            }
        }
    }
}
