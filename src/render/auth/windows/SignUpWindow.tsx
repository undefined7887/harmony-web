import React, {useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Auth, AuthActions, AuthState, AuthStep, AuthType, GoogleClaims} from "src/internal/services/auth";
import {getJwtClaims} from "src/internal/utils/token";

import {Spacer} from "src/render/common/Spacer";
import {Window} from "src/render/auth/Window";

import Styles from "./SignUpWindow.module.scss";
import googleIconSrc from "assets/images/googleIcon.svg"

export function SignUpWindow() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let dispatch = useDispatch<AppDispatch>()

    let nicknameRef = useRef<HTMLInputElement>()

    function onBack() {
        if (authState.step != AuthStep.SIGN_UP_PROCESS) {
            dispatch(AuthActions.logout())
        }
    }

    function onContinue() {
        if (authState.step != AuthStep.SIGN_UP_PROCESS) {
            dispatch(Auth.googleSignUp(authState.nonce, authState.idtoken, nicknameRef.current.textContent))
        }
    }

    function getHintText(): string {
        switch (authState.step) {
            case AuthStep.SIGN_UP:
                return "Imagine a catchy nickname"

            case AuthStep.SIGN_UP_PROCESS:
                return "One second..."

            case AuthStep.SIGN_UP_FAILED:
                if (authState.validationError) {
                    return "Wrong nickname format"
                }

                return "Failed to create account"
        }
    }

    function getPictureSrc(): string {
        if (authState.type == AuthType.GOOGLE) {
            return getJwtClaims<GoogleClaims>(authState.idtoken).picture
        }
    }

    function renderConnectorIcon(): React.ReactElement {
        if (authState.type == AuthType.GOOGLE) {
            return <img className={Styles.ConnectorIcon} src={googleIconSrc} alt=""/>
        }
    }

    return (
        <Window title="Registration"
                hint={getHintText()}
                hintError={authState.step == AuthStep.SIGN_UP_FAILED}>

            <div className={Styles.Connector}>
                <img className={Styles.ConnectorAvatar} src={getPictureSrc()} alt=""/>
                <div className={Styles.ConnectorLoader}/>
                {renderConnectorIcon()}
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

            <div className={Styles.InputHint}>
                <span className={Styles.InputHintIcon}>subdirectory_arrow_right_black</span>

                <div className={Styles.InputHintText}>
                    Nickname can contain:<br/>
                    - numbers (0-9) and letters (A-z)<br/>
                    - symbols (-_.)
                </div>
            </div>

            <Spacer/>

            <div className={Styles.Buttons}>
                <div className={Styles.ButtonBack}
                     onClick={() => onBack()}>
                    Back
                </div>
                <Spacer/>
                <div className={Styles.ButtonContinue}
                     onClick={() => onContinue()}>Continue
                </div>
            </div>
        </Window>
    )
}