import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {AuthState, AuthStep} from "src/internal/services/auth";
import {ChatState} from "src/internal/services/chat";
import {CentrifugoState} from "src/internal/services/centrifugo";
import {User} from "src/internal/services/user";
import {UserStatus} from "src/internal/api/user";

import {Focus} from "src/render/common/Focus";
import {Logo} from "src/render/common/Logo";
import {Page} from "src/render/common/Page";
import {ListPanel} from "src/render/main/ListPanel";
import {WorkspacePanel} from "src/render/main/WorkspacePanel";

import Styles from "./MainPage.module.scss"

export function MainPage() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let centrifugoState = useSelector<AppState, CentrifugoState>(state => state.centrifugo)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)

    let dispatch = useDispatch<AppDispatch>()

    function onFocus() {
        if (authState.step == AuthStep.OK && centrifugoState.connected) {
            dispatch(User.updateSelfStatus(UserStatus.ONLINE))
        }
    }

    function onBlur() {
        if (authState.step == AuthStep.OK && centrifugoState.connected) {
            dispatch(User.updateSelfStatus(UserStatus.AWAY))
        }
    }

    useEffect(() => {
        console.log("window: adding listeners")

        window.addEventListener("focus", onFocus)
        window.addEventListener("blur", onBlur)

        // First time
        if (document.hasFocus()) {
            onFocus()
        } else {
            onBlur()
        }

        return () => {
            console.log("window: removing listeners")

            window.removeEventListener("focus", onFocus)
            window.removeEventListener("blur", onBlur)
        }
    }, [centrifugoState.connected])

    function renderPage(): React.ReactElement {
        if (!centrifugoState.connected) {
            return (
                <Page>
                    <Logo className={Styles.Logo}/>
                </Page>
            )
        }

        return (
            <Page>
                <div className={Styles.Container}>
                    <ListPanel/>

                    <WorkspacePanel chatId={chatState.currentId}
                                    chatType={chatState.currentType}/>
                </div>
            </Page>
        )
    }

    return (
        <>
            {renderPage()}
        </>
    )
}
