import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {ChatState} from "src/internal/services/chat";
import {User, UserState} from "src/internal/services/user";
import {ChatModel} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";

import {Spacer} from "src/render/common/Spacer";
import {Nickname} from "src/render/main/common/Nickname";

import Styles from "./ChatItem.module.scss"

interface Props {
    chat: ChatModel
    onClick?: () => void
}

export function ChatItem({chat, onClick}: Props) {
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    let user = userState.users[chat.id]

    useEffect(() => {
        if (!user) {
            dispatch(User.get(chat.id))
        }
    }, [user])

    function renderStatus(): React.ReactElement {
        switch (user.status) {
            case UserStatus.ONLINE:
                return <div className={Styles.StatusOnline}/>
            case UserStatus.AWAY:
                return <div className={Styles.StatusAway}/>
            case UserStatus.SILENCE:
                return <div className={Styles.StatusSilence}/>
        }
    }

    function render(): React.ReactElement {
        if (!user) {
            return <div className={Styles.Loader}/>
        }

        return (
            <div className={chat.id == chatState.currentId ? Styles.ContainerActive : Styles.Container}
                 onClick={() => onClick()}>

                <div className={Styles.Photo}>
                    <img className={Styles.PhotoImage} src={user.photo} alt=""/>

                    {renderStatus()}
                </div>

                <div className={Styles.Info}>
                    <Nickname className={Styles.Nickname}
                              nickname={user.nickname}/>

                    <div className={Styles.Message}>{chat.message.text}</div>
                </div>

                <Spacer/>

                {
                    chat.unread_count > 0
                        ? <div className={Styles.UnreadCount}>{chat.unread_count}</div>
                        : <></>
                }
            </div>
        )
    }

    return (
        <>
            {render()}
        </>
    )
}
