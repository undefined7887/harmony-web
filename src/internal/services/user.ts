import {UserApi, UserModel} from "src/internal/api/user";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {timeout} from "src/internal/utils/common";
import {RETRY_TIMEOUT} from "src/internal/api/common";

export interface UserState {
    users: { [id: string]: UserModel }
}

export interface UserGetPayload {
    user: UserModel
}

const userSlice = createSlice({
    name: "user",
    initialState: {
        users: {}
    } as UserState,
    reducers: {
        get(state, action: PayloadAction<UserGetPayload>) {
            state.users[action.payload.user.id] = action.payload.user
        }
    }
})

export const UserActions = userSlice.actions

export const userReducer = userSlice.reducer

export class User {
    static get(id: string): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("user: loading", id)

            try {
                let user = await UserApi.get(id)

                dispatch(UserActions.get({user}))

                console.log("user: loaded", id)
            } catch (err) {
                console.warn("user: retrying load", id)

                await timeout(RETRY_TIMEOUT)
                dispatch(User.get(id))
            }
        }
    }
}
