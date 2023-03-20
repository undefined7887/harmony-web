import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Chat as ChatComponent} from "src/render/main/Chat";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatActions, ChatState} from "src/internal/services/chat";

import Style from "src/render/main/ChatList.module.scss"
import {Spacer} from "src/render/Spacer";
import {Profile} from "src/render/main/Profile";

export function ChatList() {
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (!chatState.loaded) {
            dispatch(Chat.list())
        }
    }, [chatState.loaded])

    function renderList(): React.ReactElement {
        return (
            <div className={Style.List}>
                {
                    Object.values(chatState.chats).map(chat => {
                        return (
                            <ChatComponent key={chat.id}
                                           chat={chat}
                                           active={chatState.currentChatId == chat.id}
                                           onClick={() => dispatch(ChatActions.chooseChat({id: chat.id}))}/>
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className={Style.Container}>
            <div className={Style.Title}>Chats</div>
            <input className={Style.Search} placeholder="Search people, chats and etc..."/>

            {renderList()}

            <Spacer/>
            <Profile/>
        </div>
    )
}
