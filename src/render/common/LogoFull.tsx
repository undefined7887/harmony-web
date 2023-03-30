import React from "react";

import logoFullSrc from "assets/images/logoFull.svg"

interface Props {
    className: string
}

export function LogoFull({className}: Props) {
    return (
        <img className={className} src={logoFullSrc} alt=""/>
    )
}