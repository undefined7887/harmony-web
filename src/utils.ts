export function timeout(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    })
}

export function classes(...classes: string[]): string {
    return classes
        .filter(name => {
            return typeof name === "string"
        })
        .join(" ")
}
