import React, {useEffect} from "react";
import {Page} from "src/render/Page";
import {OAuth} from "src/internal/services/auth";

export function OAuth2Page() {
    useEffect(() => {
        let fragment = parseFragment()

        if (!fragment.state || !fragment.idToken) {
            OAuth.sendWindowResponse({success: false})

            return
        }

        OAuth.sendWindowResponse({
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
