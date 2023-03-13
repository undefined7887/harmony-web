import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import Styles from "./App.module.scss"
import AppRoutes from "src/routes";

// Pages
import {Page as AuthPage} from "src/components/auth/Page";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.auth} element={<AuthPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
