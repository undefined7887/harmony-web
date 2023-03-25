import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Chat as ChatComponent} from "src/render/main/Chat";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatActions, ChatState} from "src/internal/services/chat";

import Styles from "src/render/main/ChatList.module.scss"
import {Spacer} from "src/render/Spacer";
import {Profile} from "src/render/main/Profile";
import {splitUserNickname, User, UserActions, UserState, validateNickname} from "src/internal/services/user";
import {ChatType} from "src/internal/api/chat";

export function ChatList() {
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    let [searchText, setSearchText] = useState<string>("")

    useEffect(() => {
        if (!chatState.chats) {
            dispatch(Chat.listChats())
            return
        }
    }, [chatState.chats])

    function renderList(): React.ReactElement {
        if (!chatState.chats) {
            return
        }

        return (
            <div className={Styles.List}>
                {
                    chatState.chats
                        .map(chat =>
                            <ChatComponent key={chat.id}
                                           chat={chat}
                                           active={chatState.currentChat?.id == chat.id}
                                           onClick={() => dispatch(ChatActions.setCurrentChat({chat}))}/>
                        )
                }
            </div>
        )
    }

    function renderSearchUser() {
        if (!userState.searchUser) {
            return
        }

        // User not loaded yet
        let user = userState.users[userState.searchUser]
        if (!user) {
            return
        }

        let [nickname, nicknameTag] = splitUserNickname(user)

        return (
            <div className={Styles.SearchUser}
                 onClick={() => {
                     dispatch(ChatActions.setCurrentChat({
                         chat: {
                             id: user.id,
                             type: ChatType.USER,
                             message: null,
                             unread_count: 0
                         }
                     }))
                 }}>
                <img className={Styles.SearchUserPhoto} src={user.photo} alt=""/>
                <div className={Styles.SearchUserNickname}>
                    {nickname}
                    <span className={Styles.SearchUserNicknameTag}>{nicknameTag}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={Styles.Container}>
            <div className={Styles.Title}>Chats</div>
            <input className={Styles.Search}
                   placeholder="Search by users by nickname"
                   value={searchText}
                   onChange={e => {
                       setSearchText(e.target.value)

                       let nickname = e.target.value.replace(" ", "")

                       if (validateNickname(nickname)) {
                           dispatch(User.search(nickname))
                       } else {
                           dispatch(UserActions.search({userId: null}))
                       }
                   }}/>

            {renderSearchUser()}
            {renderList()}

            <Spacer/>
            <Profile/>
        </div>
    )
}
