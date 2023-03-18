import React from "react";
import LogoFullSrc from "assets/images/LogoFull.svg"

interface Props {
    className: string
}

export function LogoFull({className}: Props) {
    return (
        <img className={className} src={LogoFullSrc} alt=""/>
    )
}