import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatState} from "src/internal/services/chat";
import {splitUserNickname, UserState} from "src/internal/services/user";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";

import Styles from "src/render/main/CurrentChat.module.scss"
import {Message} from "src/render/main/Message";
import {AuthState} from "src/internal/services/auth";
import {formatTime, Months, MonthsShort} from "src/internal/utils/common";
import {parseApiTime} from "src/internal/api/common";

export interface Props {
    chat: ChatModel
}

export function CurrentChat({chat}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    let messagesRef = useRef<HTMLDivElement>()
    let [messagesScroll, setMessagesScroll] = useState<boolean>(true)

    let [text, setText] = useState<string>("")

    let messages = chatState.messages[chat?.id]

    useEffect(() => {
        if (chat && !messages) {
            dispatch(Chat.listMessages(chat.id, chat.type))
        }
    }, [chat, messages])

    useEffect(() => {
        if (messagesRef.current && messages) {
            // If page on bottom or last message is sent by current user
            if (messagesScroll || messages[0].user_id == authState.user.id) {
                messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight)
            }

            // Reading messages if page on bottom and last message wasn't sent by current user
            if (messagesScroll && messages[0].user_id != authState.user.id) {
                dispatch(Chat.updateChatRead(chat.id, chat.type))
            }
        }
    }, [messages?.length])

    function createMessage() {
        if (chat.type == ChatType.USER) {
            dispatch(Chat.createMessage(chat.id, chat.type, text))
        }

        setText("")
    }

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

            let now = new Date()
            let updatedAt = parseApiTime(user.updated_at)

            let lastSeen = `at ${formatTime(updatedAt.getHours())}:${formatTime(updatedAt.getMinutes())}`

            if (updatedAt.getDate() != now.getDate()) {
                lastSeen = `${MonthsShort[updatedAt.getMonth()]} ${updatedAt.getDate()} ${lastSeen}`
            }

            switch (user.status) {
                case UserStatus.ONLINE:
                    return <div className={Styles.StatusOnline}>Online</div>
                case UserStatus.AWAY:
                    return <div className={Styles.StatusAway}>Away</div>
                case UserStatus.SILENCE:
                    return <div className={Styles.StatusSilence}>Silence</div>
                case UserStatus.OFFLINE:
                    return <div className={Styles.StatusOffline}>Last seen {lastSeen}</div>
            }
        }
    }

    function renderMessages(): React.ReactElement | React.ReactElement[] {
        if (!chat) {
            return <></>
        }

        return messages?.map(message => <Message key={message.id} message={message}/>)
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

                <div ref={messagesRef}
                     className={Styles.Messages}
                     onScroll={() => {
                         if (Math.abs(messagesRef.current.scrollTop) <= 1) {
                             setMessagesScroll(true)
                         } else {
                             setMessagesScroll(false)
                         }
                     }}>
                    {renderMessages()}
                </div>

                <input className={Styles.Input}
                       placeholder="Type here..."
                       value={text}
                       onChange={e => {
                           setText(e.target.value)
                       }}
                       onKeyDown={e => {
                           if (e.key == "Enter") {
                               e.preventDefault()
                               createMessage()
                           }
                       }}/>
            </div>
        )
    }

    return (
        <div className={Styles.Container}>
            {renderChat()}
        </div>
    )
}
