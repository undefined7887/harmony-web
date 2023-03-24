import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Chat as ChatComponent} from "src/render/main/Chat";
import {AppDispatch, AppState} from "src/internal/store";
import {Chat, ChatActions, ChatState} from "src/internal/services/chat";

import Styles from "src/render/main/ChatList.module.scss"
import {Spacer} from "src/render/Spacer";
import {Profile} from "src/render/main/Profile";
import {ChatType} from "src/internal/api/chat";
import {CentrifugoManager} from "src/internal/services/centrifugo";

export function ChatList() {
    let chatState = useSelector<AppState, ChatState>(state => state.chat)
    let dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (!chatState.chats) {
            dispatch(Chat.listChats())
            return
        }

        chatState.chats.forEach(chat => {
            if (chat.type == ChatType.USER) {
                dispatch(CentrifugoManager.subscribeUser(chat.id))
            }
        })
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
