import React, {useEffect} from "react";
import {OAUTH2_MESSAGE_TYPE, OAuth} from "src/internal/services/auth";

import {Page} from "src/render/common/Page";

export function OAuth2Page() {
    useEffect(() => {
        let fragment = parseFragment()

        if (!fragment.state || !fragment.idToken) {
            OAuth.sendWindowResponse({type: OAUTH2_MESSAGE_TYPE, success: false})

            return
        }

        OAuth.sendWindowResponse({
            type: OAUTH2_MESSAGE_TYPE,
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
