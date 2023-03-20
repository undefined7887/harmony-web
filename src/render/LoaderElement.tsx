import React from "react";

import Styles from "./LoaderElement.module.scss"
import {classes} from "src/render/utils";

interface Props {
    className?: string
}

export function LoaderElement({className}: Props) {
    return <div className={classes(Styles.Loader, className)}></div>
}
