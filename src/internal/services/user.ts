import {UserApi, UserErrors, UserModel, UserStatus} from "src/internal/api/user";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {timeout} from "src/internal/utils/common";
import {CommonErrors, RETRY_TIMEOUT} from "src/internal/api/common";
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

        addUser(state, action: PayloadAction<UserPayload>) {
            state.users[action.payload.id] = action.payload.user
        },

        searchUser(state, action: PayloadAction<UserSearchPayload>) {
            state.searchUser = action.payload.userId
        }
    }
})

export const UserActions = userSlice.actions

export const userReducer = userSlice.reducer

export class User {
    static get(id: string): AppThunkAction {
        return async function (dispatch) {
            console.log("user: loading", id)

            await timeout(1000)

            try {
                let user = await UserApi.get(id)

                dispatch(UserActions.addUser({id, user}))
                dispatch(CentrifugoManager.subscribeUser(user.id))

                console.log("user: loaded", user.id)
            } catch (err) {
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    dispatch(UserActions.addUser({id, user: {} as UserModel}))

                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.warn("user: retrying load", id)

                    await timeout(RETRY_TIMEOUT)
                    dispatch(User.get(id))
                }
            }
        }
    }

    static search(nickname: string): AppThunkAction {
        return async function (dispatch) {
            console.log("user: searching", nickname)

            try {
                let user = await UserApi.search(nickname)

                // Loading found user
                dispatch(UserActions.addUser({id: user.id, user}))
                dispatch(CentrifugoManager.subscribeUser(user.id))

                dispatch(UserActions.searchUser({userId: user.id}))

                console.log("user: found", user.id)
            } catch (err) {
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("user: retrying searching", nickname)

                    await timeout(RETRY_TIMEOUT);
                    dispatch(User.search(nickname))
                }
            }
        }
    }

    static updateSelfStatus(status: UserStatus): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("user: updating self status", status)

            try {
                await UserApi.updateSelfStatus(status)

                let authState = getState().auth
                let userState = getState().user

                let user = userState.users[authState.userId]

                dispatch(UserActions.addUser({
                    id: user.id,
                    user: {...user, status}
                }))
            } catch (err) {
                if (err.code == UserErrors.ERR_USER_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("user: retrying update self status", status)

                    await timeout(RETRY_TIMEOUT)
                    dispatch(User.updateSelfStatus(status))
                }
            }
        }
    }
}

export function validateNickname(nickname: string): boolean {
    let regex = new RegExp("^[A-z0-9-_.]{4,30}#[0-9]{4}$")

    return regex.test(nickname)
}
