import React, {useEffect} from "react";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {User, UserState} from "src/internal/services/user";

import Styles from "./Chat.module.scss"

import loadingSrc from "assets/images/loading.png"
import {UserStatus} from "src/internal/api/user";
import {AuthState} from "src/internal/services/auth";

interface Props {
    chat: ChatModel
    active: boolean

    onClick?: () => void
}

export function Chat({chat, active, onClick}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)

    let dispatch = useDispatch<AppDispatch>()

    let user = userState.users[chat.id]

    useEffect(() => {
        if (!user) {
            dispatch(User.get(chat.id))
        }
    }, [user])

    function getPhotoSrc(): string {
        switch (chat.type) {
            case ChatType.USER:
                if (user) {
                    return user.photo
                }

                return loadingSrc
        }
    }

    function renderName(): React.ReactElement {
        switch (chat.type) {
            case ChatType.USER:
                if (user) {
                    let [nickname, nicknameTag] = user.nickname.split("#")

                    return (
                        <div className={Styles.Name}>
                            {nickname}
                            <span className={Styles.NicknameTag}>{`#${nicknameTag}`}</span>
                        </div>
                    )
                }
        }
    }

    function renderStatus(): React.ReactElement {
        if (!user) {
            return
        }

        switch (user.status) {
            case UserStatus.ONLINE:
                return <div className={Styles.StatusOnline}/>
            case UserStatus.AWAY:
                return <div className={Styles.StatusAway}/>
            case UserStatus.SILENCE:
                return <div className={Styles.StatusSilence}/>
            case UserStatus.OFFLINE:
                return <></>
        }
    }

    return (
        <div className={active ? Styles.ContainerActive : Styles.Container}
             onClick={() => onClick?.()}>

            <div className={Styles.PhotoBox}>
                <img className={Styles.Photo} src={getPhotoSrc()} alt=""/>
                {renderStatus()}
            </div>

            <div className={Styles.Info}>
                {renderName()}
                <div className={Styles.Message}>
                    {`${chat.message.user_id == authState.user.id ? "You: " : ""}${chat.message.text}`}
                </div>
            </div>
        </div>
    )
}