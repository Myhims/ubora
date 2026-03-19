import clsx from "clsx";
import React, { ReactNode } from "react";
import s from "./FunBubble.module.scss";

export type FunBubbleSize = "sm" | "md" | "lg";
export type FunBubbleVariant = "light" | "contained";

interface FunBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: FunBubbleSize;
    variant?: FunBubbleVariant;
    color?: string;
    children?: ReactNode;
}


const FunBubble = ({
    size = "md",
    variant = "contained",
    color = "rgb(var(--uib-color-primary))",
    className,
    children,
    ...props
}: FunBubbleProps) => {

    return (
        <div
            {...props}
            className={clsx(s['fun-bubble'], s[`fun-bubble--${size}`], s[`fun-bubble--look-${variant}`], className)}
            style={{ ['--fun-bubble-color' as any]: color }}
        >
            {children}
        </div>
    );
};

export default FunBubble;
