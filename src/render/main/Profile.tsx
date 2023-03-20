import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "src/internal/store";
import {AuthState} from "src/internal/services/auth";

import Style from "./Profile.module.scss"

export function Profile() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    let [nickname, nicknameTag] = authState.user.nickname.split("#")

    return (
        <div className={Style.Container}>
            <img className={Style.Avatar} src={authState.user.photo} alt=""/>

            <div className={Style.Info}>
                <div className={Style.Nickname}>
                    {nickname}
                    <span className={Style.NicknameTag}>{`#${nicknameTag}`}</span>
                </div>

                <div className={Style.Status}>online</div>
            </div>
        </div>
    )
}