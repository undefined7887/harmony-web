import config from "config/config.json"

export class WebRTC {
    static async createPeerConnection() {
        let peerConnection = new RTCPeerConnection(config.rtc)

    }
}
