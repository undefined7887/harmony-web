import config from "config/config.json";

export function setCookie(name: string, data: string, expiresUnix: number, httpOnly?: boolean) {
    let cookieParts = [
        // Name and value
        `${name}=${data}`,

        // Expires
        `Expires=${new Date(expiresUnix * 1000).toUTCString()}`,

        // Domain
        `Domain=${new URL(config.addresses.public).hostname}`,

        // Secure
        `${new URL(config.addresses.public).protocol === "https:" ? "Secure" : ""}`,

        // HttpOnly
        `${httpOnly ? "HttpOnly" : ""}`,

        // Path
        `Path=/`,
    ]

    document.cookie = cookieParts.join("; ")
}

export function deleteCookie(name: string) {
    setCookie(name, "", 0)
}

export function makeUrlWithQueryParams(url: string, params: object): string {
    let result = new URL(url)

    Object
        .entries(params)
        .forEach(([param, value]) => {
            result.searchParams.append(param, value)
        })

    return result.toString()
}
