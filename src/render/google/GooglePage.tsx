import React, {useEffect} from "react";
import {Page} from "src/render/Page";
import {GooglePageResponse} from "src/feature/auth/feature";

export function GooglePage() {
    useEffect(() => {
        let fragment = parseFragment()

        if (!fragment.state || !fragment.idToken) {
            sendResult({success: false})

            return
        }

        sendResult({
            success: true,
            state: fragment.state,
            idtoken: fragment.idToken
        })

        window.close()
    })

    return (
        <Page/>
    )
}

function sendResult(result: GooglePageResponse) {
    window.opener.postMessage(result)
}

interface FragmentData {
    state?: string

    idToken?: string
}

function parseFragment(): FragmentData {
    let params = window.location.hash
        .slice(1)
        .split("&");

    let result: FragmentData = {}

    for (let param of params) {
        let [name, content] = param.split("=");

        switch (name) {
            case "state":
                result.state = content
                break

            case "id_token":
                result.idToken = content
                break
        }
    }

    return result;
}
