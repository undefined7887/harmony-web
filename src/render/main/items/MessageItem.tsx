import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {leadingZero} from "src/internal/utils/common";
import {AuthState} from "src/internal/services/auth";
import {MessageModel} from "src/internal/api/chat";
import {parseApiTime} from "src/internal/api/common";

import {classes} from "src/render/utils";

import Styles from "./MessageItem.module.scss"

export interface Props {
    message: MessageModel
}

export function MessageItem({message}: Props) {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    function formatCreatedAt(): string {
        let createdAt = parseApiTime(message.created_at)

        return `${leadingZero(createdAt.getHours())}:${leadingZero(createdAt.getMinutes())}`
    }

    return (
        <div className={classes(message.user_id == authState.userId ? Styles.ContainerRight : Styles.ContainerLeft)}>
            <div className={Styles.Text}>
                {message.text}
                <span className={Styles.Time}>{formatCreatedAt()}</span>
            </div>

            {
                message.user_id == authState.userId && message.read_user_ids.length == 0
                    ? <div className={Styles.Unread}/>
                    : <></>
            }
        </div>
    )
}
