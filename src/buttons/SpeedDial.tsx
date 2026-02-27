import clsx from "clsx";
import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useAccessibilityCompliance, useDraggable } from "../hooks";
import s from "./SpeedDial.module.scss";

export enum SpeedDialSize {
    sm = "sm",
    md = "md",
    lg = "lg"
}

interface ISpeedDialProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpeedDialSize
    icon: ReactNode
    readonly?: boolean
    variant?: 'outline' | 'contained'
    color?: string
    draggable?: boolean
}

type SpeedDialContextValue = {
    size: SpeedDialSize
    isOpen: boolean
};

const SpeedDialContext = createContext<SpeedDialContextValue | null>(null);

export const useSpeedDial = () => {
    const ctx = useContext(SpeedDialContext);
    if (!ctx) {
        throw new Error('useSpeedDial must be used within <SpeedDial>');
    }
    return ctx;
};

const SpeedDial = ({
    size = SpeedDialSize.lg,
    children,
    className,
    icon,
    variant = 'outline',
    color = 'rgb(var(--uib-color-primary))',
    readonly = false,
    draggable = false,
    ...props
}: ISpeedDialProps) => {
    const [openUpwards, setOpenUpwards] = useState(false);
    const [isOpen, setIsOpen] = useState<boolean | null>(null);
    const rippleColor = variant === 'contained' ? 'rgb(var(--uib-color-primary-foreground))' : color;
    const uac = useAccessibilityCompliance<HTMLDivElement>({ role: 'button', readonly, rippleColor: rippleColor }, [readonly, color, variant]);

    const poperRef = useRef<HTMLDivElement | null>(null);
    const drag = useDraggable({ active: draggable });

    useLayoutEffect(() => {
        if (!drag.ref?.current || !poperRef.current) return;
        
        const frRect = drag.ref?.current.getBoundingClientRect();
        const poperRect = poperRef.current.getBoundingClientRect();        

        // Height needed to display poper below frRect
        const spaceBelow = window.innerHeight - frRect.bottom;

        // Height needed above frRect
        const spaceAbove = frRect.top;

        // If popup does not fit below but fits above → open upwards
        if (spaceBelow < poperRect.height && spaceAbove >= poperRect.height) {
            setOpenUpwards(true);
        } else {
            setOpenUpwards(false);
        }
    }, [drag.ref, poperRef, drag.style?.left, drag.style?.top]);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (
                drag.ref?.current &&
                !drag.ref?.current.contains(event.target as Node)
            ) {
                if (isOpen !== null) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, [drag.ref, isOpen]);

    const bubbleColors = useMemo(() => {
        if (variant === 'contained') {
            return {
                borderColor: color,
                background: color,
            } as CSSProperties;
        }
        else {
            return {
                borderColor: color,
                color: color,
                fill: color
            } as CSSProperties;
        }
    }, [color, variant])

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const isOpenState = useMemo(() => {
        if (isOpen === true)
            return s['speed-dial__poper--open'];

        if (isOpen === false)
            return s['speed-dial__poper--closed'];

        return '';
    }, [isOpen])

    return <SpeedDialContext.Provider value={{ size: size, isOpen: !!isOpen }}>
        <div 
            className={clsx(s['speed-dial'], className)}
            {...props}
            {...drag}
        >
            <div className={clsx(s['speed-dial__bubble-button'], s[`speed-dial__bubble-button--size-${size}`], s[`speed-dial__bubble-button--variant-${variant}`])}
                {...uac}
                onClick={toggle}
                style={{ ...bubbleColors }}
            >
                {icon}
            </div>
            <div ref={poperRef}
                className={clsx(
                    s['speed-dial__poper'],
                    openUpwards ? s['speed-dial__poper--move-up'] : s['speed-dial__poper--move-down'],
                    isOpenState
                )}
            >
                {children}
            </div>
        </div>
    </SpeedDialContext.Provider>
}

interface ISpeedDialBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: SpeedDialSize
    variant?: 'outline' | 'contained'
    color?: string
    readonly?: boolean
}

const SpeedDialBubble = ({
    className,
    variant = 'outline',
    color = 'rgb(var(--uib-color-primary))',
    readonly = false,
    ...props
}: ISpeedDialBubbleProps) => {
    const { size, isOpen } = useSpeedDial(); //todo : add readonly when hidden
    const rippleColor = variant === 'contained' ? 'rgb(var(--uib-color-primary-foreground))' : color;
    const uac = useAccessibilityCompliance<HTMLDivElement>({ role: 'button', readonly: readonly || !isOpen, rippleColor: rippleColor }, [readonly, isOpen, color, variant]);

    const bubbleColors = useMemo(() => {
        if (variant === 'contained') {
            return {
                borderColor: color,
                background: color,
            } as CSSProperties;
        }
        else {
            return {
                borderColor: color,
                color: color,
                fill: color
            } as CSSProperties;
        }
    }, [color, variant])

    return <div className={clsx(s['speed-dial-bubble'], s[`speed-dial-bubble--size-${size}`], s[`speed-dial-bubble--variant-${variant}`])}
        {...uac}
        style={{ ...bubbleColors }}
        {...props}
    >
    </div>
}

SpeedDial.Bubble = SpeedDialBubble;
(SpeedDial.Bubble as any).displayName = 'SpeedDial.Bubble';
export default SpeedDial;