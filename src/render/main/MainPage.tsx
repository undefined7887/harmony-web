import React, {useEffect} from "react";
import {Page} from "src/render/Page";
import {ChatList} from "src/render/main/ChatList";

import Style from "./MainPage.module.scss"
import {CurrentChat} from "src/render/main/CurrentChat";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";
import {Logo} from "src/render/logo/Logo";
import Styles from "src/render/auth/AuthPage.module.scss";
import {ChatState} from "src/internal/services/chat";
import {CentrifugoState} from "src/internal/services/centrifugo";
import {User} from "src/internal/services/user";
import {UserStatus} from "src/internal/api/user";

export function MainPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let centrifugoState = useSelector<AppState, CentrifugoState>(state => state.centrifugo)

    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (centrifugoState.connected && authState.userId) {
            if (document.hasFocus()) {
                dispatch(User.updateSelfStatus(UserStatus.ONLINE))
            } else {
                dispatch(User.updateSelfStatus(UserStatus.AWAY))
            }

            setWindowLHandlers()
        }
    }, [centrifugoState.connected])

    function setWindowLHandlers() {
        window.addEventListener("focus", () => {
            if (authState.userId) {
                dispatch(User.updateSelfStatus(UserStatus.ONLINE))
            }
        })

        window.addEventListener("blur", () => {
            if (authState.userId) {
                dispatch(User.updateSelfStatus(UserStatus.AWAY))
            }
        })

        window.addEventListener("unload", () => {
            if (authState.userId) {
                dispatch(User.updateSelfStatus(UserStatus.OFFLINE))
            }
        })
    }

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
