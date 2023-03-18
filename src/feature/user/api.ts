import {makeRequest, METHOD_GET} from "src/feature/api";

export const ERR_USER_NOT_FOUND = 101
export const ERR_USER_ALREADY_EXISTS = 102

export interface User {
    id: string
    photo: string
    nickname: string
}

async function getSelf() {
    return await makeRequest<{}, User>(METHOD_GET, "/api/v1/user/self", {})
}

export const methods = {
    getSelf
}
