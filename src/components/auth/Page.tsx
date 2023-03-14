import React from "react";
import Styles from "./Page.module.scss"

import GoogleIconSrc from "assets/images/GoogleIcon.svg"

import {Logo} from "src/components/Logo";
import {LogoFull} from "src/components/LogoFull";
import {Space} from "src/components/Space";

export function Page() {
    return (
        <div className={Styles.Page}>
            <LogoFull className={Styles.Logo}/>

            <div className={Styles.Window}>
                <div className={Styles.Title}>Sign in</div>
                <div className={Styles.Hint}>To continue, log into your account</div>

                <div className={Styles.Button}>
                    <div className={Styles.Google}>
                        <img className={Styles.GoogleIcon} src={GoogleIconSrc} alt=""/>
                    </div>

                    <Space/>
                    <div className={Styles.GoogleText}>Continue with Google</div>
                    <Space/>
                </div>

                <Space/>

                <a className={Styles.BuildInfo}
                   href="https://github.com/undefined7887"
                   target="_blank">
                    Build: {process.env.HARMONY_VERSION}, by <span className={Styles.Author}>undefined7887</span>
                </a>
            </div>
        </div>
    )
}
