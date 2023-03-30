import React from "react";
import {classes} from "src/render/utils";

import Styles from "./Window.module.scss"

export interface Props {
    title: string
    hint: string
    hintError: boolean
    children?: React.ReactElement | React.ReactElement[]
}

export function Window({title, hint, hintError, children}: Props) {
    return (
        <div className={Styles.Window}>
            <div className={Styles.Title}>{title}</div>
            <div className={classes(Styles.Hint, hintError ? Styles.HintError : "")}>{hint}</div>

            {children}
        </div>
    )
}