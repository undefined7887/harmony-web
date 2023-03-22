import React, {useEffect} from "react";
import {Page} from "src/render/Page";
import {ChatList} from "src/render/main/ChatList";

import Style from "./MainPage.module.scss"
import {CurrentChat} from "src/render/main/CurrentChat";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";
import {Logo} from "src/render/logo/Logo";
import Styles from "src/render/auth/AuthPage.module.scss";
import {ChatState} from "src/internal/services/chat";

export function MainPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)

    function render() {
        switch (authState.step) {
            case AuthStep.INIT:
                return <Logo className={Styles.Logo}/>

            case AuthStep.OK:
                return (
                    <Page>
                        <div className={Style.Container}>
                            <ChatList/>
                            <CurrentChat chat={chatState.currentChat}/>
                        </div>
                    </Page>
                )
        }
    }

    return render()
}
