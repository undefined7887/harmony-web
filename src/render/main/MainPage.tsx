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
import {CentrifugoState} from "src/internal/services/centrifugo";

export function MainPage() {
    let centrifugoState = useSelector<AppState, CentrifugoState>(state => state.centrifugo)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)

    function render() {
        if (!centrifugoState.connected) {
            return <Logo className={Styles.Logo}/>
        }

        return (
            <Page>
                <div className={Style.Container}>
                    <ChatList/>
                    <CurrentChat chat={chatState.currentChat}/>
                </div>
            </Page>
        )
    }

    return render()
}
