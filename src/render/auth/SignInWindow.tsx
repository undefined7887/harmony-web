import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {Spacer} from "src/render/Spacer";
import {classes} from "src/render/utils";
import {AppDispatch, AppState} from "src/internal/store";
import {Auth, AuthState, AuthStep, AuthType} from "src/internal/services/auth";

import Styles from "./SignInWindow.module.scss";

import googleIconSrc from "assets/images/googleIcon.svg";

export function SignInWindow() {
    let dispatch = useDispatch<AppDispatch>()
    let authState = useSelector<AppState, AuthState>(state => state.auth)

    function getHintClasses(): string {
        switch (authState.step) {
            case AuthStep.SIGN_IN:
            case AuthStep.SIGN_IN_PROCESS:
                return Styles.WindowHint

            case AuthStep.SIGN_IN_FAILED:
                return Styles.WindowHintError
        }
    }

    function getHintText(): string {
        switch (authState.step) {
            case AuthStep.SIGN_IN:
                return "To continue, log into your account"

            case AuthStep.SIGN_IN_PROCESS:
                return "Waiting for authentication..."

            case AuthStep.SIGN_IN_FAILED:
                if (authState.type == AuthType.GOOGLE) {
                    return "Google authentication failed"
                }
        }
    }

    return (
        <div className={Styles.Window}>
            <div className={Styles.WindowTitle}>Sign in</div>
            <div className={getHintClasses()}>{getHintText()}</div>

            <Button icon={googleIconSrc}
                    text="Continue with Google"
                    onClick={() => {
                        // Do not start sign in if already started
                        if (authState.step != AuthStep.SIGN_IN_PROCESS) {
                            dispatch(Auth.googleSignIn())
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
