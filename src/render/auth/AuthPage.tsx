import React, {useEffect} from "react";
import {useSelector} from "react-redux";

import Styles from "./AuthPage.module.scss"

import {Page} from "src/render/Page";
import {LogoFull} from "src/render/logo/LogoFull";
import {SignInWindow} from "src/render/auth/SignInWindow";
import {SignUpWindow} from "src/render/auth/SignUpWindow";

import {AppState} from "src/feature/store";
import {Step} from "src/feature/auth/slice";

export function AuthPage() {
    let auth = useSelector((state: AppState) => state.auth)

    useEffect(() => {
        // Trying to authenticate
    }, [])

    function window(): React.ReactElement {
        switch (auth.step) {
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
            <LogoFull className={Styles.Logo}/>

            {window()}
        </Page>
    )
}
