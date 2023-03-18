import React, {useRef} from "react";
import {useDispatch, useSelector} from "react-redux";

import Styles from "./SignUpWindow.module.scss";

import {AppDispatch, AppState} from "src/feature/store";
import {actions, State, Step, Type} from "src/feature/auth/slice";
import {classes} from "src/render/utils";

import {Spacer} from "src/render/Spacer";

import GoogleIconSrc from "assets/images/GoogleIcon.svg"
import {extractGoogleClaims, googleSignUp} from "src/feature/auth/feature";

export function SignUpWindow() {
    let state = useSelector<AppState, State>(state => state.auth)
    let dispatch = useDispatch<AppDispatch>()

    let nicknameRef = useRef<HTMLInputElement>()

    function onBack() {
        if (state.step != Step.SIGN_UP_PROCESS) {
            dispatch(actions.signIn())
        }
    }

    function onContinue() {
        if (state.step != Step.SIGN_UP_PROCESS) {
            dispatch(googleSignUp(state.nonce, state.idtoken, nicknameRef.current.textContent))
        }
    }

    function hintClasses(): string {
        switch (state.step) {
            case Step.SIGN_UP:
            case Step.SIGN_UP_PROCESS:
                return Styles.WindowHint

            case Step.SIGN_UP_FAILED:
                return classes(Styles.WindowHint, Styles.WindowHintError)
        }
    }

    function hintText(): string {
        switch (state.step) {
            case Step.SIGN_UP:
                return "Imagine a catchy nickname"

            case Step.SIGN_UP_PROCESS:
                return "One second..."

            case Step.SIGN_UP_FAILED:
                if (state.validationError) {
                    return "Wrong nickname format"
                }

                return "Failed to create account"
        }
    }

    function connectorIcon(): React.ReactElement {
        if (state.type == Type.GOOGLE) {
            return <img className={Styles.ConnectorIcon} src={GoogleIconSrc} alt=""/>
        }
    }

    function getPicture(): string {
        if (state.type == Type.GOOGLE) {
            return extractGoogleClaims(state.idtoken).picture
        }
    }

    return (
        <div className={Styles.Window}>
            <div className={Styles.WindowTitle}>Registration</div>
            <div className={hintClasses()}>{hintText()}</div>

            <div className={Styles.Connector}>
                <img className={Styles.ConnectorAvatar} src={getPicture()} alt=""/>
                <div className={Styles.ConnectorLoader}/>
                {connectorIcon()}

            </div>

            <div className={Styles.Input}
                 onClick={() => nicknameRef.current.focus()}>

                <span className={Styles.InputPlaceholder}>@</span>
                <span ref={nicknameRef}
                      className={Styles.InputContent}
                      contentEditable
                      spellCheck={false}
                      onKeyDown={(e) => {
                          if (e.key == "Enter") {
                              e.preventDefault()
                              onContinue()
                          }
                      }}/>
                <span className={Styles.InputPlaceholder}>#0000</span>
            </div>

            <div className={Styles.NicknameHint}>
                <span className={Styles.NicknameHintIcon}>subdirectory_arrow_right_black</span>

                <div className={Styles.NicknameHintText}>
                    Nickname can contain:<br/>
                    - numbers (0-9) and letters (A-z)<br/>
                    - symbols (-_.)
                </div>
            </div>

            <Spacer/>

            <div className={Styles.Buttons}>
                <div className={classes(Styles.Button, Styles.Back)}
                     onClick={() => onBack()}>
                    Back
                </div>
                <Spacer/>
                <div className={classes(Styles.Button, Styles.Continue)}
                     onClick={() => onContinue()}>Continue
                </div>
            </div>
        </div>
    )
}