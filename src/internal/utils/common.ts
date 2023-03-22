export function timeout(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    })
}

export function formatTime(num: number): string {
    if (num < 10) {
        return `0${num}`
    }

    return num.toString()
}
