import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Route, Routes, useNavigate} from "react-router-dom";
import AppRoutes from "src/routes";
import {AppDispatch, AppState} from "src/internal/store";
import {Auth, AuthState, AuthStep} from "src/internal/services/auth";

import "./App.scss";

// Pages
import {AuthPage} from "src/render/auth/AuthPage";
import {OAuth2Page} from "src/render/auth/oauth2/OAuth2Page";
import {MainPage} from "src/render/main/MainPage";
import {CentrifugoManager, CentrifugoState} from "src/internal/services/centrifugo";
import {User} from "src/internal/services/user";
import {UserStatus} from "src/internal/api/user";

export function App() {
    let navigate = useNavigate();

    let centrifugoState = useSelector<AppState, CentrifugoState>(state => state.centrifugo)
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        window.addEventListener("focus", () => {
            console.log("window: focus")
            dispatch(User.updateSelfStatus(UserStatus.ONLINE))
        })

        window.addEventListener("blur", () => {
            console.log("window: blur")
            dispatch(User.updateSelfStatus(UserStatus.AWAY))
        })

        window.addEventListener("unload", () => {
            console.log("window: will be closed")
            dispatch(User.updateSelfStatus(UserStatus.OFFLINE))
        })
    }, [])

    useEffect(() => {
        if (centrifugoState.connected && !document.hasFocus()) {
            console.log("window: blur")
            dispatch(User.updateSelfStatus(UserStatus.AWAY))
        }
    }, [centrifugoState.connected])

    useEffect(() => {
        switch (authState.step) {
            case AuthStep.INIT:
                dispatch(Auth.testAuth())
                break

            case AuthStep.SIGN_IN:
                navigate(AppRoutes.auth)
                return

            case AuthStep.OK:
                dispatch(CentrifugoManager.connect())
                return
        }
    }, [authState.step])

    return (
        <Routes>
            <Route path={AppRoutes.main} element={<MainPage/>}/>
            <Route path={AppRoutes.auth} element={<AuthPage/>}/>
            <Route path={AppRoutes.oauth2} element={<OAuth2Page/>}/>
        </Routes>
    )
}
