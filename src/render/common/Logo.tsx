import React from "react";

import logoSrc from "assets/images/logo.svg"

interface Props {
    className: string
}

export function Logo({className}: Props) {
    return (
        <img className={className} src={logoSrc} alt=""/>
    )
}