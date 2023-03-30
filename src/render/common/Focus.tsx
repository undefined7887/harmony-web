import React, {useEffect} from "react";

export interface Props {
    onFocus?: () => void
    onBlur?: () => void
    children?: React.ReactElement | React.ReactElement[]
}

export function Focus({onFocus, onBlur, children}: Props) {
    return (
        <>
            {children}
        </>
    )
}