import {HttpMethods, makeHttpRequest} from "src/internal/api/common";
import {AuthResponse, GoogleSignInRequest, GoogleSignUpRequest} from "src/internal/api/auth";

export class CallErrors {
    static ERR_CALL_NOT_FOUND = 401
    static ERR_CALL_ALREADY_EXISTS = 402
}

export enum CallStatus {
    REQUEST = "request",
    ACCEPTED = "accepted",
    DECLINED = "declined",
    FINISHED = "finished",

    // Client statuses
    RTC_EXCHANGING = "exchanging",
    RTC_CONNECTED = "connected",
}

export enum CallDataName {
    OFFER = "offer",
    ANSWER = "answer",
    CANDIDATE = "candidate"
}

export interface CallModel {
    id: string
    user_id: string
    peer_id: string
    status: CallStatus
}

export interface CreateCallResponse {
    call_id: string
}

export interface UpdateCallStatusRequest {
    status: string
}

export interface ProxyCallDataRequest {
    name: CallDataName
    data: object
}

export interface CallProxyDataNotification {
    id: string
    name: CallDataName
    data: object
}

export class CallApi {
    static async createCall(userId: string): Promise<CreateCallResponse> {
        return await makeHttpRequest<unknown, CreateCallResponse>
        (HttpMethods.POST, `/api/v1/call/user/${userId}`, {})
    }

    static async getCall(): Promise<CallModel> {
        return await makeHttpRequest<unknown, CallModel>(HttpMethods.GET, "/api/v1/call", {})
    }

    static async updateCallStatus(id: string, status: CallStatus): Promise<void> {
        return await makeHttpRequest<UpdateCallStatusRequest, void>
        (HttpMethods.PUT, `/api/v1/call/${id}/status`, {status})
    }

    static async proxyCallData(id: string, name: CallDataName, data: object): Promise<void> {
        return await makeHttpRequest<ProxyCallDataRequest, void>
        (HttpMethods.PUT, `/api/v1/call/${id}/data`, {name, data})
    }
}
