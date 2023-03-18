export function classes(...classes: string[]): string {
    return classes
        .filter(name => {
            return typeof name === "string"
        })
        .join(" ")
}
