import React from "react";
import {useSelector} from "react-redux";
import {Page} from "src/render/Page";
import {LogoFull} from "src/render/logo/LogoFull";
import {SignInWindow} from "src/render/auth/SignInWindow";
import {SignUpWindow} from "src/render/auth/SignUpWindow";
import {Logo} from "src/render/logo/Logo";
import {AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";

import Styles from "./AuthPage.module.scss"

export function AuthPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    function logo(): React.ReactElement {
        switch (authState.step) {
            case AuthStep.INIT:
                return <Logo className={Styles.Logo}/>

            default:
                return <LogoFull className={Styles.LogoFull}/>
        }
    }

    function window(): React.ReactElement {
        switch (authState.step) {
            case AuthStep.SIGN_IN:
            case AuthStep.SIGN_IN_PROCESS:
            case AuthStep.SIGN_IN_FAILED:
                return <SignInWindow/>

            case AuthStep.SIGN_UP:
            case AuthStep.SIGN_UP_PROCESS:
            case AuthStep.SIGN_UP_FAILED:
                return <SignUpWindow/>
        }
    }

    return (
        <Page>
            {logo()}
            {window()}
        </Page>
    )
}
