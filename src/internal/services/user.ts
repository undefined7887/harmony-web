import {UserApi, UserErrors, UserModel, UserStatus} from "src/internal/api/user";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";
import {useEffect} from "react";
import {CentrifugoActions, CentrifugoManager} from "src/internal/services/centrifugo";

export interface UserState {
    users: { [id: string]: UserModel }
    searchUser?: string
}

export interface UserPayload {
    id: string
    user?: UserModel
}

export interface UserSearchPayload {
    userId: string
}

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: {}
    } as UserState,
    reducers: {
        reset(state) {
            console.log("user: reset")

            return {users: {}}
        },

        load(state, action: PayloadAction<UserPayload>) {
            state.users[action.payload.id] = action.payload.user
        },

        search(state, action: PayloadAction<UserSearchPayload>) {
            state.searchUser = action.payload.userId
        }
    }
})

export const UserActions = userSlice.actions

export const userReducer = userSlice.reducer

export class User {
    static get(id: string): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("user: loading", id)

            let userState = getState().user

            if (!userState.users.hasOwnProperty(id)) {
                dispatch(CentrifugoManager.subscribeUser(id))
            }

            dispatch(UserActions.load({id, user: null}))
            await timeout(500)

            try {
                let user = await UserApi.get(id)

                dispatch(UserActions.load({id: user.id, user}))

                console.log("user: loaded", id)
            } catch (err) {
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    return
                }

                console.warn("user: retrying load", id)

                await timeout(RETRY_TIMEOUT)
                dispatch(User.get(id))
            }
        }
    }

    static updateSelfStatus(status: UserStatus): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("user: updating self status to", status)

            let authState = getState().auth
            let userState = getState().user

            let user = userState.users[authState.userId]

            try {
                await UserApi.updateSelfStatus(status)
                dispatch(UserActions.load({id: user.id, user: {...user, status}}))
            } catch (err) {
                await timeout(RETRY_TIMEOUT)
                dispatch(User.updateSelfStatus(status))
            }
        }
    }

    static update(user: UserModel): AppThunkAction {
        return async function (dispatch) {
            console.log("user: updating", user.id)

            dispatch(UserActions.load({id: user.id, user}))
        }
    }

    static search(nickname: string): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("user: searching", nickname)

            let userState = getState().user

            try {
                let user = await UserApi.search(nickname)

                dispatch(UserActions.search({userId: user.id}))

                if (!userState.users.hasOwnProperty(user.id)) {
                    dispatch(UserActions.load({id: user.id, user}))
                    dispatch(CentrifugoManager.subscribeUser(user.id))
                }
            } catch (err) {
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    dispatch(UserActions.search({userId: null}))
                    return
                }

                await timeout(RETRY_TIMEOUT);
                dispatch(User.search(nickname))
            }
        }
    }
}

export function splitUserNickname(user: UserModel): string[] {
    let [nickname, nicknameTag] = user.nickname.split("#")

    return [nickname, `#${nicknameTag}`]
}

export function validateNickname(nickname: string): boolean {
    let regex = new RegExp("^[A-z0-9-_.]{4,30}#[0-9]{4}$")

    return regex.test(nickname)
}
