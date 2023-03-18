import {methods} from "src/feature/user/api";
import {actions as userActions} from "src/feature/user/slice";
import {actions as authActions} from "src/feature/auth/slice";
import {AppThunkAction} from "src/feature/store";
import {timeout} from "src/feature/utils";

export function getSelf(): AppThunkAction {
    return async function (dispatch) {
        try {
            await timeout(1000)

            let user = await methods.getSelf()

            dispatch(userActions.auth({user}))
        } catch (err) {
            // Setting auth page for initial state
            dispatch(authActions.signIn())

            // Logging out user
            dispatch(userActions.logout())
        }
    }
}
