import React from "react";
import {Page} from "src/render/Page";
import {ChatList} from "src/render/main/ChatList";

import Style from "./MainPage.module.scss"
import {CurrentChat} from "src/render/main/CurrentChat";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";
import {Logo} from "src/render/logo/Logo";
import Styles from "src/render/auth/AuthPage.module.scss";
import {Spacer} from "src/render/Spacer";
import {Profile} from "src/render/main/Profile";

export function MainPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    function render() {
        switch (authState.step) {
            case AuthStep.INIT:
                return <Logo className={Styles.Logo}/>

            case AuthStep.OK:
                return (
                    <Page>
                        <div className={Style.Container}>
                            <ChatList/>
                            <CurrentChat/>
                        </div>
                    </Page>
                )
        }
    }

    return render()
}
