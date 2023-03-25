import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatState, TYPING_TIMEOUT} from "src/internal/services/chat";
import {splitUserNickname, UserState} from "src/internal/services/user";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";

import Styles from "src/render/main/CurrentChat.module.scss"
import {Message} from "src/render/main/Message";
import {AuthState} from "src/internal/services/auth";
import {formatTime, MonthsShort} from "src/internal/utils/common";
import {parseApiTime} from "src/internal/api/common";

export interface Props {
    chat: ChatModel
}

export function CurrentChat({chat}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    let messages = chatState.messages[chat?.id]

    let messagesRef = useRef<HTMLDivElement>()
    let [messagesScroll, setMessagesScroll] = useState<boolean>(true)

    let [messageText, setMessageText] = useState<string>("")
    let [messageLastTypingUpdate, setMessageLastTypingUpdate] = useState<number>(0)

    useEffect(() => {
        if (chat && !messages) {
            dispatch(Chat.listMessages(chat.id, chat.type))
        }
    }, [chat, messages])

    let currentUser = userState.users[authState.userId]

    useEffect(() => {
        if (!messagesRef.current || !messages) {
            return
        }

        if (messages[0]?.user_id == authState.userId || messagesScroll) {
            messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight)
        }

        if (
            messages[0] &&
            messages[0].user_id != authState.userId &&
            !messages[0].read_user_ids.includes(authState.userId) &&
            messagesScroll &&
            currentUser.status == UserStatus.ONLINE
        ) {
            dispatch(Chat.updateChatRead(chat.id, chat.type))
        }
    }, [messages, messagesScroll, currentUser.status == UserStatus.ONLINE])

    function createMessage() {
        if (chat.type == ChatType.USER) {
            dispatch(Chat.createMessage(chat.id, chat.type, messageText.trim()))
        }

        setMessageText("")
    }

    function updateTyping() {
        let now = new Date().getTime()

        // Sending update typing every 2 seconds
        if (Math.abs(now - messageLastTypingUpdate) > TYPING_TIMEOUT) {
            setMessageLastTypingUpdate(now)

            dispatch(Chat.updateChatTyping(chat.id, chat.type, true))
        }
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
        return messages?.map(message => <Message key={message.id} message={message}/>)
    }

    function renderTyping(): React.ReactElement {
        if (chat.type == ChatType.USER) {
            let isTyping = chatState.typing[chat.id]
                ?.findIndex(typing => typing.userId == chat.id) >= 0

            if (!isTyping) {
                return
            }

            return (
                <div className={Styles.Typing}>
                    <img className={Styles.TypingPhoto} src={userState.users[chat.id].photo} alt=""/>
                    <div className={Styles.TypingLoader}/>
                </div>
            )
        }
    }

    function renderChat(): React.ReactElement {
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

                {renderTyping()}

                <input className={Styles.Input}
                       placeholder="Type here..."
                       value={messageText}
                       onChange={e => {
                           setMessageText(e.target.value)
                       }}
                       onKeyDown={e => {
                           if (e.key == "Enter") {
                               e.preventDefault()
                               createMessage()
                               return
                           }

                           updateTyping()
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
