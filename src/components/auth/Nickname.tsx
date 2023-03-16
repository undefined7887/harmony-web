import React, {useEffect, useRef, useState} from "react";
import Styles from "./Nickname.module.scss";

import AvatarSrc from "assets/images/Avatar.jpg"
import GoogleIconSrc from "assets/images/GoogleIcon.svg"
import {Space} from "src/components/Space";
import {classes} from "src/utils";

export function Nickname() {
    let nicknameRef = useRef<HTMLInputElement>()

    return (
        <div className={Styles.Window}>
            <div className={Styles.Title}>Registration</div>
            <div className={Styles.Hint}>Imagine a catchy nickname</div>

            <div className={Styles.Connector}>
                <img className={Styles.Avatar} src={AvatarSrc} alt=""/>
                <div className={Styles.Loader}/>
                <img className={Styles.GoogleIcon} src={GoogleIconSrc} alt=""/>
            </div>

            <div className={Styles.Input}
                 onClick={() => nicknameRef.current.focus()}>

                <span className={Styles.InputPlaceholder}>@</span>
                <span ref={nicknameRef}
                      className={Styles.InputContent}
                      contentEditable={true}
                      spellCheck={false}/>
                <span className={Styles.InputPlaceholder}>#0000</span>
            </div>

            <div className={Styles.NicknameHint}>
                <span className={Styles.NicknameHintIcon}>subdirectory_arrow_right_black</span>

                <div className={Styles.NicknameHintText}>
                    Nickname can contain only numbers<br/> (0-9) and letters (a-z)
                </div>
            </div>

            <Space/>

            <div className={Styles.Buttons}>
                <div className={classes(Styles.Button, Styles.Left)}>Back</div>
                <Space/>
                <div className={classes(Styles.Button, Styles.Right)}>Finish</div>
            </div>
        </div>
    )
}