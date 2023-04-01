import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunkAction} from "src/internal/store";
import {timeout} from "src/internal/utils/common";
import {CommonErrors, RETRY_TIMEOUT} from "src/internal/api/common";
import {CallApi, CallDataName, CallErrors, CallModel, CallStatus} from "src/internal/api/call";

import config from "config/config.json"

const CALL_TIMEOUT = 5000

export interface CallState {
    call?: CallModel
    callPeerConnection?: RTCPeerConnection
    callLocalStream?: MediaStream
    callRemoteStream?: MediaStream
}

export interface CallNewPayload {
    call: CallModel
}

export interface CallPeerConnectionPayload {
    peerConnection: RTCPeerConnection
}

export interface CallStreamPayload {
    stream: MediaStream
}

export interface CallUpdatePayload {
    status: CallStatus
}

const callSlice = createSlice({
    name: "call",
    initialState: {} as CallState,
    reducers: {
        reset(state) {
            console.log("call: reset")
            return {}
        },

        addCall(state, action: PayloadAction<CallNewPayload>) {
            state.call = action.payload.call
        },

        addCallPeerConnection(state, action: PayloadAction<CallPeerConnectionPayload>) {
            state.callPeerConnection = action.payload.peerConnection
        },

        addLocalStream(state, action: PayloadAction<CallStreamPayload>) {
            state.callLocalStream = action.payload.stream
        },

        addRemoteStream(state, action: PayloadAction<CallStreamPayload>) {
            state.callRemoteStream = action.payload.stream
        },

        updateCall(state, action: PayloadAction<CallUpdatePayload>) {
            state.call.status = action.payload.status
        }
    }
})

export const CallActions = callSlice.actions

export const callReducer = callSlice.reducer

export class Call {
    static createCall(userId: string): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("call: creating call with", userId)

            try {
                let createCallResponse = await CallApi.createCall(userId)

                let authState = getState().auth

                dispatch(CallActions.addCall({
                    call: {
                        id: createCallResponse.call_id,
                        user_id: authState.userId,
                        peer_id: userId,
                        status: CallStatus.REQUEST,
                    }
                }))

                console.log("call: call created")
            } catch (err) {
                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("call: retrying create call")

                    await timeout(RETRY_TIMEOUT);
                    dispatch(Call.createCall(userId))
                }
            }
        }
    }

    static getCall(): AppThunkAction {
        return async function (dispatch) {
            console.log("call: getting call")

            try {
                let call = await CallApi.getCall()

                dispatch(CallActions.addCall({call}))

                console.log("call: got a call")
            } catch (err) {
                if (err.code == CallErrors.ERR_CALL_NOT_FOUND) {
                    return
                }

                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("call: retrying getting call")

                    await timeout(RETRY_TIMEOUT);
                    dispatch(Call.getCall())
                }
            }
        }
    }

    static updateCall(status: CallStatus): AppThunkAction {
        return async function (dispatch, getState) {
            console.log("call: updating status to", status)

            let callState = getState().call

            try {
                await CallApi.updateCallStatus(callState.call.id, status)

                if (status == CallStatus.ACCEPTED) {
                    dispatch(CallActions.updateCall({
                        status: CallStatus.ACCEPTED
                    }))

                    dispatch(Call.createPeerConnection(true))

                    return
                }

                dispatch(Call.endCall())
            } catch (err) {
                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("call: retrying updating call status")

                    await timeout(RETRY_TIMEOUT);
                    dispatch(Call.updateCall(status))
                }
            }
        }
    }

    static createPeerConnection(initializer: boolean): AppThunkAction {
        return async function (dispatch, getState) {
            let localStream: MediaStream;

            let callState = getState().call

            // Getting user media stream
            try {
                localStream = await navigator
                    .mediaDevices
                    .getUserMedia({audio: true})

                dispatch(CallActions.addLocalStream({
                    stream: localStream
                }))
            } catch (err) {
                alert("Please grant access to microphone")
                dispatch(Call.endCall())

                return
            }

            let peerConnection = new RTCPeerConnection(config.rtc)

            localStream
                .getAudioTracks()
                .forEach(track => {
                    console.log("call: using device", track.label)

                    peerConnection.addTrack(track, localStream)
                })

            peerConnection.ontrack = function (e) {
                console.log("call: webrtc: received track", e)

                dispatch(CallActions.addRemoteStream({
                    stream: e.streams[0]
                }))
            }

            peerConnection.onicecandidate = function (e) {
                if (e.candidate != null && e.candidate.candidate != null) {
                    console.log("call: webrtc: sending icecandidate")

                    dispatch(Call.proxyData(callState.call.id, CallDataName.CANDIDATE, e.candidate))
                }
            }

            peerConnection.onconnectionstatechange = function (e) {
                if (peerConnection.connectionState == "connected") {
                    dispatch(CallActions.updateCall({
                        status: CallStatus.RTC_CONNECTED
                    }))
                } else {
                    console.log(`call: webrtc: call timeout ${CALL_TIMEOUT / 1000}s`)

                    dispatch(CallActions.updateCall({
                        status: CallStatus.RTC_EXCHANGING
                    }))

                    dispatch(Call.timeoutCall())
                }
            }

            dispatch(CallActions.addCallPeerConnection({
                peerConnection: peerConnection
            }))

            dispatch(CallActions.updateCall({
                status: CallStatus.RTC_EXCHANGING
            }))

            if (initializer) {
                let offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer)

                dispatch(Call.proxyData(callState.call.id, CallDataName.OFFER, offer))
            }

            console.log(callState)

            dispatch(Call.timeoutCall())
        }
    }

    static updatePeerConnection(name: CallDataName, data: object): AppThunkAction {
        return async function (dispatch, getState) {
            let callState = getState().call

            switch (name) {
                case CallDataName.OFFER:
                    console.log("call: webrtc: received offer")

                    if (!callState.callPeerConnection) {
                        return
                    }

                    await callState.callPeerConnection.setRemoteDescription(<RTCSessionDescriptionInit>data)

                    let answer = await callState.callPeerConnection.createAnswer()
                    await callState.callPeerConnection.setLocalDescription(answer)

                    dispatch(Call.proxyData(callState.call.id, CallDataName.ANSWER, answer))
                    break

                case CallDataName.ANSWER:
                    console.log("call: webrtc: received answer")

                    if (!callState.callPeerConnection) {
                        return
                    }

                    await callState.callPeerConnection.setRemoteDescription(<RTCSessionDescriptionInit>data)
                    break

                case CallDataName.CANDIDATE:
                    console.log("call: webrtc: received icecandidate")

                    if (!callState.callPeerConnection) {
                        return
                    }

                    await callState.callPeerConnection.addIceCandidate(data)
                    break
            }
        }
    }

    static timeoutCall(): AppThunkAction {
        return async function (dispatch, getState) {
            await timeout(CALL_TIMEOUT)

            let callState = getState().call

            if (!callState.call) {
                return
            }

            if (callState.call.status == CallStatus.RTC_EXCHANGING) {
                console.log("call: webrtc: ending call due to timeout")
                dispatch(Call.endCall())
            }
        }
    }

    static endCall(): AppThunkAction {
        return async function (dispatch, getState) {
            let callState = getState().call

            console.log("call: ending call")

            try {
                await CallApi.updateCallStatus(callState.call.id, CallStatus.FINISHED)
            } catch (err) {
                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("call: retrying ending call")

                    await timeout(RETRY_TIMEOUT);
                    dispatch(Call.endCall())

                    return
                }
            }

            callState = getState().call

            // Stopping audio tracks
            if (callState.callLocalStream) {
                callState.callLocalStream
                    .getAudioTracks()
                    .forEach(track => track.stop())
            }

            // Closing peer connection
            if (callState.callPeerConnection) {
                callState.callPeerConnection.close()

                // Resetting handlers
                callState.callPeerConnection.ontrack = null
                callState.callPeerConnection.onicecandidate = null
                callState.callPeerConnection.onconnectionstatechange = null
            }

            dispatch(CallActions.reset())
            console.log("call: ended")
        }
    }

    static proxyData(id: string, name: CallDataName, data: object): AppThunkAction {
        return async function () {
            try {
                await CallApi.proxyCallData(id, name, data)
                console.log("call: proxy", name)
            } catch (err) {
                if (err.code == CommonErrors.ERR_UNKNOWN) {
                    console.log("call: retrying proxy", name)

                    await timeout(RETRY_TIMEOUT);
                    await Call.proxyData(id, name, data)
                }
            }
        }
    }
}