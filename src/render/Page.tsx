import React from "react";
import Styles from "./Page.module.scss";

interface Props {
    children?: React.ReactElement | React.ReactElement[]
}

export function Page({children}: Props) {
    return (
        <div className={Styles.Page}>
            {children}
        </div>
    )
}
