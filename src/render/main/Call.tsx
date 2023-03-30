import React from "react";

import Styles from "./Call.module.scss"
import {UserModel} from "src/internal/api/user";
import {Nickname} from "src/render/main/common/Nickname";
import {Spacer} from "src/render/common/Spacer";
import {classes} from "src/render/utils";

export interface Props {
    user: UserModel
}

export function Call({user}: Props) {
    return (
        <div className={Styles.Container}>
            <img className={Styles.Photo} src={user.photo} alt=""/>

            <Nickname className={Styles.Nickname} nickname={user.nickname} removeTag={true}/>
            <Spacer/>

            <div className={Styles.Decline}>
                <div className={classes(Styles.MaterialIcon, Styles.Icon)}>call_end</div>
            </div>

            <div className={Styles.Accept}>
                <div className={classes(Styles.MaterialIcon, Styles.Icon)}>call</div>
            </div>
        </div>
    )
}