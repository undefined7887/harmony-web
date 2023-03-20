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

export function App() {
    let navigate = useNavigate();

    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        switch (authState.step) {
            case AuthStep.INIT:
                dispatch(Auth.testAuth())
                break

            case AuthStep.SIGN_IN:
                navigate(AppRoutes.auth)
                return

            case AuthStep.OK:
                navigate(AppRoutes.main)
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
