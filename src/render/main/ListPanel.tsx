import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {ChatItem} from "src/render/main/items/ChatItem";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatActions, ChatState} from "src/internal/services/chat";

import {Spacer} from "src/render/common/Spacer";
import {Profile} from "src/render/main/Profile";
import {User, UserActions, UserState, validateNickname} from "src/internal/services/user";
import {ChatModel, ChatType} from "src/internal/api/chat";

import Styles from "src/render/main/ListPanel.module.scss"
import {UserModel} from "src/internal/api/user";
import {Nickname} from "src/render/main/common/Nickname";
import {CallPopup} from "src/render/main/CallPopup";
import {Call, CallState} from "src/internal/services/call";

export function ListPanel() {
    let userState = useSelector<AppState, UserState>(state => state.user)
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let callState = useSelector<AppState, CallState>(state => state.call)
    let dispatch = useDispatch<AppDispatch>()

    let searchUser = userState.users[userState.searchUser]

    useEffect(() => {
        if (!chatState.chats) {
            dispatch(Chat.listChats())
            return
        }
    }, [chatState.chats])

    useEffect(() => {
        if (!callState.call) {
            dispatch(Call.getCall())
        }
    }, [callState.call])

    function onSearchInputChange(text: string) {
        let nickname = text.replace(" ", "")

        if (validateNickname(nickname)) {
            dispatch(User.search(nickname))
        } else {
            dispatch(UserActions.searchUser({userId: null}))
        }
    }

    function onSearchUserClick(user: UserModel) {
        dispatch(ChatActions.setCurrentChat({chatId: user.id, chatType: ChatType.USER}))
    }

    function onChatClick(chat: ChatModel) {
        dispatch(ChatActions.setCurrentChat({chatId: chat.id, chatType: chat.type}))
    }

    return (
        <div className={Styles.Container}>
            <div className={Styles.Title}>Chats</div>
            <input className={Styles.Search}
                   placeholder="Search by users by nickname"
                   onChange={e => onSearchInputChange(e.target.value)}/>

            {
                userState.searchUser
                    ? <SearchUser user={searchUser}
                                  onClick={() => onSearchUserClick(searchUser)}/>
                    : <></>
            }

            <div className={Styles.ChatList}>
                {
                    chatState.chats?.map(chat =>
                        <ChatItem key={chat.id}
                                  chat={chat}
                                  onClick={() => onChatClick(chat)}/>
                    )
                }
            </div>

            <Spacer/>

            {
                callState.call
                    ? <CallPopup/>
                    : <></>
            }

            <Profile/>
        </div>
    )
}

interface SearchUserProps {
    user: UserModel
    onClick?: () => void
}

function SearchUser({user, onClick}: SearchUserProps) {
    return (
        <div className={Styles.SearchUser}
             onClick={() => onClick()}>

            <img className={Styles.SearchUserPhoto} src={user.photo} alt=""/>

            <Nickname className={Styles.SearchUserNickname}
                      nickname={user.nickname}/>
        </div>
    )
}
