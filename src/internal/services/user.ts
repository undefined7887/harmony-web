import {UserApi, UserErrors, UserModel, UserStatus} from "src/internal/api/user";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";
import {useEffect} from "react";

export interface UserState {
    users: { [id: string]: UserModel }
}

export interface UserPayload {
    id: string
    user?: UserModel
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
    }
})

export const UserActions = userSlice.actions

export const userReducer = userSlice.reducer

export class User {
    static get(id: string): AppThunkAction {
        return async function (dispatch) {
            console.log("user: loading", id)

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

            if (!getState().centrifugo.connected) {
                console.log("user: not connected to centrifugo")
                return
            }

            try {
                await UserApi.updateSelfStatus(status)
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
}

export function splitUserNickname(user: UserModel): string[] {
    let [nickname, nicknameTag] = user.nickname.split("#")

    return [nickname, `#${nicknameTag}`]
}
