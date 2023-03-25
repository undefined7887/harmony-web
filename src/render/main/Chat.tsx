import React, {useEffect} from "react";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {useDispatch, useSelector} from "react-redux";
import {Spacer} from "src/render/Spacer";
import {AppDispatch, AppState} from "src/internal/store";
import {UserStatus} from "src/internal/api/user";
import {AuthState} from "src/internal/services/auth";
import {splitUserNickname, User, UserState} from "src/internal/services/user";


import Styles from "./Chat.module.scss"
import {LoaderElement} from "src/render/LoaderElement";
import {CentrifugoManager} from "src/internal/services/centrifugo";

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

    // When user is loading, entry with null value will be added
    let userExists = userState.users.hasOwnProperty(chat.id)

    useEffect(() => {
        if (!userExists) {
            dispatch(User.get(chat.id))
            dispatch(CentrifugoManager.subscribeUser(chat.id))
        }
    }, [userExists])

    function renderPhoto(): React.ReactElement {
        if (chat.type == ChatType.USER) {
            return <img className={Styles.Photo} src={user.photo} alt=""/>
        }
    }

    function renderName(): React.ReactElement {
        if (chat.type == ChatType.USER) {
            let [nickname, nicknameTag] = splitUserNickname(user)

            return (
                <div className={Styles.Name}>
                    {nickname}
                    <span className={Styles.NicknameTag}>{nicknameTag}</span>
                </div>
            )
        }
    }

    function renderStatus(): React.ReactElement {
        if (chat.type == ChatType.USER) {
            switch (user.status) {
                case UserStatus.ONLINE:
                    return <div className={Styles.StatusOnline}/>
                case UserStatus.AWAY:
                    return <div className={Styles.StatusAway}/>
                case UserStatus.SILENCE:
                    return <div className={Styles.StatusSilence}/>
            }
        }
    }

    function render(): React.ReactElement {
        if (!user) {
            return <LoaderElement className={Styles.Loader}/>
        }

        return (
            <div className={active ? Styles.ContainerActive : Styles.Container}
                 onClick={() => user ? onClick?.() : null}>

                <div className={Styles.PhotoBox}>
                    {renderPhoto()}
                    {renderStatus()}
                </div>

                <div className={Styles.Info}>
                    {renderName()}

                    <div className={Styles.Message}>
                        {
                            chat.message.user_id == authState.userId ? `You: ${chat.message.text}` : chat.message.text
                        }
                    </div>
                </div>

                <Spacer/>

                {
                    chat.unread_count > 0 ? (
                        <div className={Styles.UnreadCount}>
                            {chat.unread_count}
                        </div>
                    ) : <></>
                }
            </div>
        )
    }

    return render()
}