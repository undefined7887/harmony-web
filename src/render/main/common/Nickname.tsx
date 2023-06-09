import React from "react";
import {classes} from "src/render/utils";

import Styles from "./Nickname.module.scss"

export interface Props {
    className?: string
    nickname: string
    removeTag?: boolean
}

export function Nickname({className, nickname, removeTag}: Props) {
    let [nicknameBase, nicknameTag] = nickname.split("#")

    return (
        <div className={classes(Styles.Base, className)}>
            {nicknameBase}
            {
                nicknameTag.length > 0 && !removeTag
                    ? <span className={Styles.Tag}>#{nicknameTag}</span>
                    : <></>
            }
        </div>
    )
}