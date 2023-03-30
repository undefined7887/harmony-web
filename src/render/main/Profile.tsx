import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState} from "src/internal/services/auth";

import {UserState} from "src/internal/services/user";
import {Nickname} from "src/render/main/common/Nickname";

import Styles from "./Profile.module.scss"
import {UserStatus} from "src/internal/api/user";

export function Profile() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)

    let user = userState.users[authState.userId]

    function renderStatus() {
        switch (user.status) {
            case UserStatus.ONLINE:
                return <div className={Styles.StatusOnline}>Online</div>

            case UserStatus.AWAY:
                return <div className={Styles.StatusAway}>Away</div>
        }
    }

    return (
        <div className={Styles.Container}>
            <img className={Styles.Avatar} src={user.photo} alt=""/>

            <div className={Styles.Info}>
                <Nickname className={Styles.Nickname}
                          nickname={user.nickname}/>

                {renderStatus()}
            </div>
        </div>
    )
}