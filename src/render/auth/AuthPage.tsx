import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";

import {Page} from "src/render/common/Page";
import {Logo} from "src/render/common/Logo";
import {LogoFull} from "src/render/common/LogoFull";
import {SignInWindow} from "src/render/auth/windows/SignInWindow";
import {SignUpWindow} from "src/render/auth/windows/SignUpWindow";

import Styles from "./AuthPage.module.scss"

export function AuthPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    function renderLogo(): React.ReactElement {
        switch (authState.step) {
            case AuthStep.INIT:
                return <Logo className={Styles.Logo}/>

            default:
                return <LogoFull className={Styles.LogoFull}/>
        }
    }

    function renderWindow(): React.ReactElement {
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
            {renderLogo()}
            {renderWindow()}
        </Page>
    )
}
