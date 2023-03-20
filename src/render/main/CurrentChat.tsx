import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {ChatState} from "src/internal/services/chat";
import {splitUserNickname, UserState} from "src/internal/services/user";
import {ChatType} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";

import Styles from "src/render/main/CurrentChat.module.scss"
import {Logo} from "src/render/logo/Logo";

export function CurrentChat() {
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    function renderPhoto() {
        if (chatState.currentChat.type == ChatType.USER) {
            return <img className={Styles.Photo} src={userState.users[chatState.currentChat.id].photo} alt=""/>
        }
    }

    function renderName() {
        if (chatState.currentChat.type == ChatType.USER) {
            let [nickname, nicknameTag] = splitUserNickname(userState.users[chatState.currentChat.id])

            return (
                <div className={Styles.Name}>
                    {nickname}
                    <div className={Styles.NicknameTag}>{nicknameTag}</div>
                </div>
            )
        }
    }

    function renderStatus(): React.ReactElement {
        if (chatState.currentChat.type == ChatType.USER) {
            let user = userState.users[chatState.currentChat.id]

            switch (user.status) {
                case UserStatus.ONLINE:
                    return <div className={Styles.StatusOnline}>Online</div>
                case UserStatus.AWAY:
                    return <div className={Styles.StatusAway}>Away</div>
                case UserStatus.SILENCE:
                    return <div className={Styles.StatusSilence}>Silence</div>
                case UserStatus.OFFLINE:
                    return <div className={Styles.StatusOffline}>Offline</div>
            }
        }
    }

    function render():
        React.ReactElement {
        if (!chatState.currentChat) {
            return <div className={Styles.SelectChat}>👈 Select chat from list</div>
        }

        return (
            <div className={Styles.Wrap}>
                <div className={Styles.Header}>
                    {renderPhoto()}

                    <div className={Styles.Info}>
                        {renderName()}
                        {renderStatus()}
                    </div>
                </div>

                <div className={Styles.Messages}>

                </div>

                <input className={Styles.Input} placeholder="Type here..."/>
            </div>
        )
    }

    return (
        <div className={Styles.Container}>
            {render()}
        </div>
    )
}
