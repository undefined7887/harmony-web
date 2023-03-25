import {HttpMethods, makeHttpRequest} from "src/internal/api/common";
import {timeout} from "src/internal/utils/common";

export class UserErrors {
    static ERR_USER_NOT_FOUND = 101
    static ERR_USER_ALREADY_EXISTS = 102
}

export enum UserStatus {
    OFFLINE = "offline",
    SILENCE = "silence",
    AWAY = "away",
    ONLINE = "online"
}

export interface UserModel {
    id: string
    status: UserStatus
    photo: string
    nickname: string
    updated_at: string
}

export interface UpdateStatusRequest {
    status: UserStatus
}

export class UserApi {
    static async getSelf(): Promise<UserModel> {
        return await makeHttpRequest<unknown, UserModel>(HttpMethods.GET, "/api/v1/user/self", {})
    }

    static async get(id: string): Promise<UserModel> {
        return await makeHttpRequest<unknown, UserModel>(HttpMethods.GET, `/api/v1/user/${id}`, {})
    }

    static async updateSelfStatus(status: UserStatus) {
        return await makeHttpRequest<UpdateStatusRequest, void>(HttpMethods.PUT, `/api/v1/user/status`, {status})
    }

    static async search(nickname: string): Promise<UserModel> {
        return await makeHttpRequest<unknown, UserModel>(HttpMethods.GET, `/api/v1/user/search?nickname=${encodeURIComponent(nickname)}`, {})
    }
}
