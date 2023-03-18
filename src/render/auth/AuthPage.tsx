import React from "react";
import {useSelector} from "react-redux";

import Styles from "./AuthPage.module.scss"

import {Page} from "src/render/Page";
import {LogoFull} from "src/render/logo/LogoFull";
import {SignInWindow} from "src/render/auth/SignInWindow";
import {SignUpWindow} from "src/render/auth/SignUpWindow";

import {AppState} from "src/feature/store";
import {State, Step} from "src/feature/auth/slice";
import {Logo} from "src/render/logo/Logo";
import {Simulate} from "react-dom/test-utils";

export function AuthPage() {
    let state = useSelector<AppState, State>(state => state.auth)

    function logo(): React.ReactElement {
        switch (state.step) {
            case Step.INIT:
                return <Logo className={Styles.Logo}/>

            default:
                return <LogoFull className={Styles.LogoFull}/>
        }
    }

    function window(): React.ReactElement {
        switch (state.step) {
            case Step.SIGN_IN:
            case Step.SIGN_IN_PROCESS:
            case Step.SIGN_IN_FAILED:
                return <SignInWindow/>

            case Step.SIGN_UP:
            case Step.SIGN_UP_PROCESS:
            case Step.SIGN_UP_FAILED:
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
