import React, {useEffect, useRef} from "react";

import Styles from "./CallPopup.module.scss"
import {Nickname} from "src/render/main/common/Nickname";
import {Spacer} from "src/render/common/Spacer";
import {classes} from "src/render/utils";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, AppState} from "src/internal/store";
import {Call, CallState} from "src/internal/services/call";
import {AuthState} from "src/internal/services/auth";
import {UserState} from "src/internal/services/user";
import {CallStatus} from "src/internal/api/call";

export function CallPopup() {
    let authState = useSelector<AppState, AuthState>(state => state.auth)
    let userState = useSelector<AppState, UserState>(state => state.user)
    let callState = useSelector<AppState, CallState>(state => state.call)
    let dispatch = useDispatch<AppDispatch>()

    let audioRef = useRef<HTMLMediaElement>();

    useEffect(() => {
        if (audioRef.current && callState.callRemoteStream) {
            audioRef.current.srcObject = callState.callRemoteStream
        }
    }, [audioRef.current, callState.callRemoteStream])

    let user = callState.call.user_id == authState.userId
        ? userState.users[callState.call.peer_id]
        : userState.users[callState.call.user_id]

    function onAccept() {
        dispatch(Call.updateCall(CallStatus.ACCEPTED))
    }

    function onDecline() {
        dispatch(Call.updateCall(CallStatus.DECLINED))
    }

    function onEnd() {
        dispatch(Call.endCall())
    }

    function renderStatus() {
        switch (callState.call.status) {
            case CallStatus.REQUEST:
                return <div className={Styles.Status}>{
                    callState.call.user_id == authState.userId
                        ? "Calling..."
                        : "Incoming call"
                }</div>

            case CallStatus.ACCEPTED:
                return <div className={Styles.Status}>Accepted</div>

            case CallStatus.DECLINED:
                return <div className={Styles.Status}>Declined</div>

            case CallStatus.RTC_EXCHANGING:
                return <div className={Styles.Status}>RTC: exchanging</div>

            case CallStatus.RTC_CONNECTED:
                return <div className={Styles.Status}>RTC: connected</div>
        }
    }

    function render() {
        if (!user) {
            return
        }

        return (
            <div className={Styles.Container}>
                <img className={Styles.Photo} src={user.photo} alt=""/>

                <div className={Styles.Info}>
                    <Nickname className={Styles.Nickname}
                              nickname={user.nickname}
                              removeTag={true}/>

                    {renderStatus()}
                </div>

                <Spacer/>

                <div className={Styles.Decline}
                     onClick={
                         () => callState.call.status == CallStatus.REQUEST
                             ? onDecline()
                             : onEnd()
                     }>
                    <div className={classes(Styles.MaterialIcon, Styles.Icon)}>call_end</div>
                </div>

                {
                    callState.call.user_id != authState.userId && callState.call.status == CallStatus.REQUEST
                        ? (

                            <div className={Styles.Accept}
                                 onClick={() => onAccept()}>
                                <div className={classes(Styles.MaterialIcon, Styles.Icon)}>call</div>
                            </div>
                        )
                        : <></>
                }

                {
                    callState.callRemoteStream
                        ? <audio ref={audioRef} style={{display: "none"}} autoPlay/>
                        : <></>
                }
            </div>
        )
    }

    return (
        <>
            {render()}
        </>
    )
}