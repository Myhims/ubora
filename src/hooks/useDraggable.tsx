import { useCallback, useEffect, useRef, useState } from "react";

export type DraggableHookOptions = {
    active?: boolean;
};

const useDraggable = <T extends HTMLElement>({
    active = true
}: DraggableHookOptions = {}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [canDrag, setCanDrag] = useState(false);
    const [isFixed, setIsFixed] = useState(false);

    const isPointerDown = useRef(false);

    const startPointer = useRef({ x: 0, y: 0 });
    const startPos = useRef({ x: 0, y: 0 });

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (!ref.current || !active) return;

        isPointerDown.current = true;

        const rect = ref.current.getBoundingClientRect();
        const currentX = rect.left + window.scrollX;
        const currentY = rect.top + window.scrollY;

        setPos({ x: currentX, y: currentY });
        startPos.current = { x: currentX, y: currentY };

        startPointer.current = {
            x: e.clientX,
            y: e.clientY,
        };

        setIsFixed(true);
        setCanDrag(false);
        setDragging(false);
    }, [active]);



    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const onPointerMove = (e: PointerEvent) => {
            if (!isPointerDown.current) return;

            e.preventDefault();

            const dx = e.clientX - startPointer.current.x;
            const dy = e.clientY - startPointer.current.y;

            if (!canDrag && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
                setCanDrag(true);
                setDragging(true);
                el.setPointerCapture(e.pointerId);
                document.body.style.overflow = "hidden";
            }

            if (!dragging) return;

            const rect = el.getBoundingClientRect();

            const newX = startPos.current.x + dx;
            const newY = startPos.current.y + dy;

            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;

            setPos({
                x: Math.min(Math.max(0, newX), maxX),
                y: Math.min(Math.max(0, newY), maxY),
            });
        };

        const onPointerUp = (e: PointerEvent) => {
            if (dragging) {
                el.releasePointerCapture(e.pointerId);
            }

            document.body.style.overflow = "";

            isPointerDown.current = false;
            setDragging(false);
            setCanDrag(false);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [dragging, canDrag]);

    const style: React.CSSProperties = isFixed
        ? {
            position: "fixed",
            left: pos.x,
            top: pos.y,
            cursor: dragging ? "grabbing" : canDrag ? "grab" : "",
            touchAction: "none",
            userSelect: 'none'
        }
        : {
            touchAction: "none",
        };

    if (active)
        return {
            ref,
            style,
            onPointerDown,
        };

    return {};
};

export default useDraggable;
