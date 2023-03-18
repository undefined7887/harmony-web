import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Route, Routes, useNavigate} from "react-router-dom";

import "./App.scss";
import AppRoutes from "src/routes";

// Pages
import {AuthPage} from "src/render/auth/AuthPage";
import {GooglePage} from "src/render/google/GooglePage";

import {AppDispatch, AppState} from "src/feature/store";
import {Auth, State as UserState} from "src/feature/user/slice";
import {getSelf} from "src/feature/user/feature";


export function App() {
    let navigate = useNavigate();

    let userState = useSelector<AppState, UserState>(state => state.user)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        switch (userState.auth) {
            // TODO: Move to main page
            case Auth.UNKNOWN:
                dispatch(getSelf())
                return

            case Auth.UNAUTHORIZED:
                navigate(AppRoutes.auth)
                return

            case Auth.AUTHORIZED:
                navigate(AppRoutes.main)
                return
        }
    }, [userState.auth])


    return (
        <Routes>
            <Route index element={<h1 style={{color: "white"}}>Main page</h1>}/>
            <Route path={AppRoutes.auth} element={<AuthPage/>}/>
            <Route path={AppRoutes.google} element={<GooglePage/>}/>
        </Routes>
    )
}
