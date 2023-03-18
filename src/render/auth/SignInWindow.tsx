import React from "react";
import {useDispatch, useSelector} from "react-redux";
import Styles from "./SignInWindow.module.scss";

import {Spacer} from "src/render/Spacer";

import GoogleIconSrc from "assets/images/GoogleIcon.svg";
import {classes} from "src/render/utils";
import {AppDispatch, AppState} from "src/feature/store";
import {State, Step, Type} from "src/feature/auth/slice";
import {googleSignIn} from "src/feature/auth/feature";

export function SignInWindow() {
    let dispatch = useDispatch<AppDispatch>()
    let state = useSelector<AppState, State>(state => state.auth)

    function hintClasses(): string {
        switch (state.step) {
            case Step.SIGN_IN:
            case Step.SIGN_IN_PROCESS:
                return Styles.WindowHint

            case Step.SIGN_IN_FAILED:
                return classes(Styles.WindowHint, Styles.WindowHintError)
        }
    }

    function hintText(): string {
        switch (state.step) {
            case Step.SIGN_IN:
                return "To continue, log into your account"

            case Step.SIGN_IN_PROCESS:
                return "Waiting for authentication..."

            case Step.SIGN_IN_FAILED:
                if (state.type == Type.GOOGLE) {
                    return "Google authentication failed"
                }
        }
    }

    return (
        <div className={Styles.Window}>
            <div className={Styles.WindowTitle}>Sign in</div>
            <div className={hintClasses()}>{hintText()}</div>

            <Button icon={GoogleIconSrc}
                    text="Continue with Google"
                    onClick={() => {
                        // Do not start sign in if already started
                        if (state.step != Step.SIGN_IN_PROCESS) {
                            dispatch(googleSignIn())
                        }
                    }}/>

            <Spacer/>

            <a className={Styles.BuildInfo}
               href="https://github.com/undefined7887"
               target="_blank">
                Build: {process.env.HARMONY_VERSION}, by <span className={Styles.Author}>undefined7887</span>
            </a>
        </div>
    )
}

interface ButtonProps {
    icon: string

    text: string

    onClick?: () => void
}

function Button({icon, text, onClick}: ButtonProps) {
    return (
        <div className={Styles.Button} onClick={onClick}>
            <div className={Styles.ButtonIconBox}>
                <img className={Styles.ButtonIcon} src={icon} alt=""/>
            </div>

            <Spacer/>
            <div className={Styles.ButtonText}>{text}</div>
            <Spacer/>
        </div>
    )
}
