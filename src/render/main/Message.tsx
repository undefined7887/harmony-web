import React from "react";

import Style from "./Message.module.scss"
import {MessageModel} from "src/internal/api/chat";
import {classes} from "src/render/utils";
import {parseApiTime} from "src/internal/api/common";
import {formatTime} from "src/internal/utils/common";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState} from "src/internal/services/auth";

export interface Props {
    message: MessageModel
}

export function Message({message}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    let createdAt = parseApiTime(message.created_at)

    function messageClasses(): string {
        if (message.user_id == authState.user.id) {
            return classes(Style.Container, Style.Right)
        }

        return Style.Container
    }

    function renderUnread(): React.ReactElement {
        if (message.user_id == authState.user.id && message.read_user_ids.length == 0) {
            return <div className={Style.Unread}/>
        }
    }

    return (
        <div className={messageClasses()}>
            <div className={Style.Content}>
                {message.text}

                <span className={Style.Time}>
                    {`${formatTime(createdAt.getHours())}:${formatTime(createdAt.getMinutes())}`}
                </span>
            </div>

            {renderUnread()}
        </div>
    )
}
