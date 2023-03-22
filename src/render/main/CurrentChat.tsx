import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatState} from "src/internal/services/chat";
import {splitUserNickname, UserState} from "src/internal/services/user";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";

import Styles from "src/render/main/CurrentChat.module.scss"
import {Message} from "src/render/main/Message";

export interface Props {
    chat: ChatModel
}

export function CurrentChat({chat}: Props) {
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (chat && !chatState.messages[chat.id]) {
            dispatch(Chat.listMessages(chat.id, chat.type))
        }
    }, [chat, chatState.messages[chat?.id]])

    function renderPhoto() {
        if (chat.type == ChatType.USER) {
            return <img className={Styles.Photo} src={userState.users[chat.id].photo} alt=""/>
        }
    }

    function renderName() {
        if (chat.type == ChatType.USER) {
            let [nickname, nicknameTag] = splitUserNickname(userState.users[chat.id])

            return (
                <div className={Styles.Name}>
                    {nickname}
                    <div className={Styles.NicknameTag}>{nicknameTag}</div>
                </div>
            )
        }
    }

    function renderStatus(): React.ReactElement {
        if (chat.type == ChatType.USER) {
            let user = userState.users[chat.id]

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

    function renderMessages(): React.ReactElement | React.ReactElement[] {
        if (!chat) {
            return <></>
        }

        return chatState.messages[chat.id]
            ?.map(message => <Message key={message.id} message={message}/>)
    }

    function renderChat():
        React.ReactElement {
        if (!chat) {
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
                    {renderMessages()}
                </div>

                <input className={Styles.Input} placeholder="Type here..."/>
            </div>
        )
    }

    return (
        <div className={Styles.Container}>
            {renderChat()}
        </div>
    )
}
