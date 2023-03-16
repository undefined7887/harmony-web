import React, {useCallback} from "react";
import Styles from "./Page.module.scss"

import {LogoFull} from "src/components/logo/LogoFull";
import {Google} from "src/components/auth/Google";

import Particles from "react-tsparticles";
import {Nickname} from "src/components/auth/Nickname";

export function Page() {
    return (
        <div className={Styles.Page}>
            <LogoFull className={Styles.Logo}/>

            <Nickname/>
        </div>
    )
}
