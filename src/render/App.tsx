import React from "react";
import {Provider} from "react-redux";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import "./App.scss";
import AppRoutes from "src/routes";

// Pages
import {AuthPage} from "src/render/auth/AuthPage";
import {GooglePage} from "src/render/google/GooglePage";

import {store} from "src/feature/store";

export function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path={AppRoutes.auth} element={<AuthPage/>}/>
                    <Route path={AppRoutes.google} element={<GooglePage/>}/>
                </Routes>
            </BrowserRouter>
        </Provider>
    )
}
