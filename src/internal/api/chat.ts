import {HttpMethods, makeHttpRequest} from "src/internal/api/common";

export class ChatErrors {
    static ERR_MESSAGE_NOT_FOUND = 301
    static ERR_CHATS_NOT_FOUND = 302
}

export enum ChatType {
    USER = "user",
    GROUP = "group"
}

export interface ChatModel {
    id: string
    type: ChatType
    message: MessageModel
    unread_count: number
}

export interface MessageModel {
    id: string
    user_id: string
    peer_id: string
    peer_type: ChatType
    text: string
    edited: boolean
    read_user_ids: string[]
    created_at: string
    updated_at: string
}

export interface ListChatsResponse {
    items: ChatModel[]
}


export interface ListMessagesResponse {
    items: MessageModel[]
}

export interface CreateMessageRequest {
    text: string
}

export interface CreateMessageResponse {
    message_id: string
}

export class ChatApi {
    static async listChats(): Promise<ListChatsResponse> {
        return await makeHttpRequest<unknown, ListChatsResponse>(HttpMethods.GET, "/api/v1/chat", {})
    }

    static async updateChatRead(peerId: string, peerType: string): Promise<void> {
        return await makeHttpRequest<unknown, void>(HttpMethods.PUT, `/api/v1/chat/${peerType}/${peerId}/read`, {})
    }

    static async listMessages(peerId: string, peerType: string): Promise<ListMessagesResponse> {
        return await makeHttpRequest<unknown, ListMessagesResponse>(HttpMethods.GET, `/api/v1/chat/${peerType}/${peerId}`, {})
    }

    static async createMessage(peerId: string, peerType: string, text: string): Promise<CreateMessageResponse> {
        return await makeHttpRequest<CreateMessageRequest, CreateMessageResponse>
        (HttpMethods.POST, `/api/v1/chat/${peerType}/${peerId}`, {text})
    }

}
