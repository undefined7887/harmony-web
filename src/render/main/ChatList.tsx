import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Chat as ChatComponent} from "src/render/main/Chat";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatActions, ChatState} from "src/internal/services/chat";

import Styles from "src/render/main/ChatList.module.scss"
import {Spacer} from "src/render/Spacer";
import {Profile} from "src/render/main/Profile";

export function ChatList() {
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (!chatState.chats) {
            dispatch(Chat.list())
        }
    }, [chatState.chats])

    function renderList(): React.ReactElement {
        if (!chatState.chats) {
            return
        }

        return (
            <div className={Styles.List}>
                {
                    chatState.chats.map(chat => {
                        return (
                            <ChatComponent key={chat.id}
                                           chat={chat}
                                           active={chatState.currentChat?.id == chat.id}
                                           onClick={() => dispatch(ChatActions.setCurrent({chat}))}/>
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className={Styles.Container}>
            <div className={Styles.Title}>Chats</div>
            <input className={Styles.Search} placeholder="Search people, chats and etc..."/>

            {renderList()}

            <Spacer/>
            <Profile/>
        </div>
    )
}
