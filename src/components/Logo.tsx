import React from "react";

import LogoSrc from "assets/images/Logo.svg"

interface Props {
    className: string
}

export function Logo({className}: Props) {
    return (
        <img className={className} src={LogoSrc} alt=""/>
    )
}