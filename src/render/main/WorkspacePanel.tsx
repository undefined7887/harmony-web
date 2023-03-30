import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatState, TYPING_TIMEOUT} from "src/internal/services/chat";
import {AuthState} from "src/internal/services/auth";
import {UserState} from "src/internal/services/user";
import {ChatModel, ChatType} from "src/internal/api/chat";
import {UserStatus} from "src/internal/api/user";
import {parseApiTime} from "src/internal/api/common";
import {leadingZero, MonthsShort} from "src/internal/utils/common";

import {Nickname} from "src/render/main/common/Nickname";
import {MessageItem} from "src/render/main/items/MessageItem";

import Styles from "src/render/main/WorkspacePanel.module.scss"

const SCROLL_THRESHOLD = 2

export interface Props {
    chatId?: string
    chatType?: ChatType
}

export function WorkspacePanel({chatId, chatType}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    let messageListRef = useRef<HTMLDivElement>()
    let [messageListTop, setMessageListTop] = useState<boolean>(true)

    let user = userState.users[chatId]
    let currentUser = userState.users[authState.userId]
    let messages = chatState.messages[chatId]

    useEffect(() => {
        if (chatId && !messages) {
            dispatch(Chat.listMessages(chatId, chatType))
        }
    }, [chatId, messages])

    useEffect(() => {
        if (!messageListRef.current) {
            return
        }

        if (messages && messageListTop && currentUser.status == UserStatus.ONLINE) {
            dispatch(Chat.updateChatRead(chatId, chatType))
        }

        if (messages && authState.userId == messages[0]?.user_id || messageListTop) {
            messageListRef.current.scrollTo(0, messageListRef.current.scrollHeight)
        }

    }, [messages, messageListTop, currentUser.status == UserStatus.ONLINE])

    function onInputText(text: string) {
        dispatch(Chat.createMessage(chatId, chatType, text.trim()))
    }

    function onInputTyping() {
        dispatch(Chat.updateChatTyping(chatId, chatType, true))
    }

    function renderStatus(): React.ReactElement {
        let updatedAt = parseApiTime(user.updated_at)
        let lastSeen = `at ${leadingZero(updatedAt.getHours())}:${leadingZero(updatedAt.getMinutes())}`

        if (updatedAt.getDate() != new Date().getDate()) {
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

    function renderChat(): React.ReactElement {
        if (!chatId) {
            return (
                <div className={Styles.ContainerEmpty}>
                    👈 Select chat from list
                </div>
            )
        }

        return (
            <div className={Styles.ContainerFull}>
                <div className={Styles.Header}>
                    <img className={Styles.HeaderPhoto} src={user.photo} alt=""/>
                    <div className={Styles.HeaderInfo}>
                        <Nickname className={Styles.HeaderNickname}
                                  nickname={user.nickname}/>

                        {renderStatus()}
                    </div>
                </div>

                <div ref={messageListRef}
                     className={Styles.MessageList}
                     onScroll={() =>
                         setMessageListTop(Math.abs(messageListRef.current.scrollTop) < SCROLL_THRESHOLD)}>
                    {
                        messages?.map(message => <MessageItem key={message.id} message={message}/>)
                    }
                </div>
                {
                    chatState.typing[chatId]?.findIndex(typing => typing.userId == chatId) >= 0
                        ? (
                            <div className={Styles.Typing}>
                                <img className={Styles.TypingPhoto} src={userState.users[chatId].photo} alt=""/>
                                <div className={Styles.TypingLoader}/>
                            </div>
                        )
                        : <></>
                }

                <Input onText={onInputText}
                       onTyping={onInputTyping}/>
            </div>
        )
    }

    return (
        <>
            {renderChat()}
        </>
    )
}

interface InputProps {
    onText?: (text: string) => void
    onTyping?: () => void
}

function Input({onText, onTyping}: InputProps) {
    let [text, setText] = useState<string>("")
    let [lastTyping, setLastTyping] = useState<number>(0)

    function onKeyDown() {
        let now = new Date().getTime()

        if (now - lastTyping > TYPING_TIMEOUT) {
            onTyping()
        }

        setLastTyping(now)
    }

    return (
        <input className={Styles.Input}
               placeholder="Type here..."
               value={text}
               onChange={e => setText(e.target.value)}
               onKeyDown={e => {
                   if (e.key == "Enter") {
                       e.preventDefault()

                       onText(text)
                       setText("")

                       return
                   }

                   onKeyDown()
               }}/>
    )
}
