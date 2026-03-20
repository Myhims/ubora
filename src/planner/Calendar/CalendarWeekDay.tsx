import clsx from "clsx"
import { type ReactNode, useRef, useState } from "react"
import { DatesHelper } from "../../helpers/DatesHelper"
import { Tooltip } from "../../simple"
import s from './CalendarWeekDay.module.scss'
import type { CalendarDay } from "./Models/CalendarDay"
import type { CalendarEvent } from "./Models/CalendarEvent"

const HOUR_HEIGHT_PX = 60;
const MIN_EVENT_WIDTH_PX = 30;
const SNAP_MINUTES = 15;

type DragAndDropElement = {
    event: CalendarEvent
    type: 'drag' | 'resize-start' | 'resize-end'
}

export interface ICalendarWeekDayProps {
    day: CalendarDay
    hours: number[]
    dayStartHour: number
    dayEndHour: number
    timedEvents: CalendarEvent[]
    calendarEventsManaged: CalendarEvent[]
    dayColumnWidth: number
    uniqueCalendarId: string
    isToday: boolean
    toDayKey: (date?: Date | null) => string
    onTimedEventDrop: (eventId: string, newStart: Date, newEnd: Date) => void
}

const computeTimedColumns = (events: CalendarEvent[]): Map<string, { col: number, totalCols: number }> => {
    const result = new Map<string, { col: number, totalCols: number }>();
    if (events.length === 0) return result;

    const sorted = [...events].sort((a, b) =>
        new Date(a.startedOn).getTime() - new Date(b.startedOn).getTime()
    );

    const groups: CalendarEvent[][] = [];
    let currentGroup: CalendarEvent[] = [];
    let groupEndTime = 0;

    for (const event of sorted) {
        const start = new Date(event.startedOn).getTime();
        const end = new Date(event.finishedOn).getTime();

        if (currentGroup.length === 0 || start < groupEndTime) {
            currentGroup.push(event);
            groupEndTime = Math.max(groupEndTime, end);
        } else {
            groups.push(currentGroup);
            currentGroup = [event];
            groupEndTime = end;
        }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    for (const group of groups) {
        const colEnds: number[] = [];
        const eventCols: Map<string, number> = new Map();

        for (const event of group) {
            const start = new Date(event.startedOn).getTime();
            const end = new Date(event.finishedOn).getTime();

            let placed = false;
            for (let c = 0; c < colEnds.length; c++) {
                if (start >= colEnds[c]) {
                    colEnds[c] = end;
                    eventCols.set(event.id, c);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                const newCol = colEnds.length;
                colEnds.push(end);
                eventCols.set(event.id, newCol);
            }
        }

        const totalCols = colEnds.length;
        for (const event of group) {
            result.set(event.id, { col: eventCols.get(event.id) ?? 0, totalCols });
        }
    }

    return result;
};

const CalendarWeekDay = ({
    day,
    hours,
    dayStartHour,
    dayEndHour,
    timedEvents,
    calendarEventsManaged,
    dayColumnWidth,
    uniqueCalendarId,
    isToday,
    toDayKey,
    onTimedEventDrop,
}: ICalendarWeekDayProps) => {

    const [resizePreview, setResizePreview] = useState<{
        eventId: string
        newStart: Date
        newEnd: Date
    } | null>(null);

    const resizePreviewRef = useRef(resizePreview);
    resizePreviewRef.current = resizePreview;

    const isResizing = useRef(false);

    const snapToGrid = (date: Date): Date => {
        const snapped = new Date(date);
        const minutes = snapped.getMinutes();
        snapped.setMinutes(Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES, 0, 0);
        return snapped;
    };

    const handleResizeMouseDown = (
        e: React.MouseEvent<HTMLDivElement>,
        event: CalendarEvent,
        type: 'resize-start' | 'resize-end'
    ) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing.current = true;

        const originalStart = new Date(event.startedOn);
        const originalEnd = new Date(event.finishedOn);
        const startY = e.clientY;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT_PX) * 60);

            let newStart = new Date(originalStart);
            let newEnd = new Date(originalEnd);

            if (type === 'resize-end') {
                newEnd = snapToGrid(new Date(originalEnd.getTime() + deltaMinutes * 60 * 1000));
                if (newEnd.getTime() - newStart.getTime() < SNAP_MINUTES * 60 * 1000) {
                    newEnd = new Date(newStart.getTime() + SNAP_MINUTES * 60 * 1000);
                }
            } else {
                newStart = snapToGrid(new Date(originalStart.getTime() + deltaMinutes * 60 * 1000));
                if (newEnd.getTime() - newStart.getTime() < SNAP_MINUTES * 60 * 1000) {
                    newStart = new Date(newEnd.getTime() - SNAP_MINUTES * 60 * 1000);
                }
            }

            setResizePreview({ eventId: event.id, newStart, newEnd });
        };

        const onMouseUp = () => {
            if (resizePreviewRef.current) {
                onTimedEventDrop(
                    resizePreviewRef.current.eventId,
                    resizePreviewRef.current.newStart,
                    resizePreviewRef.current.newEnd
                );
            }
            isResizing.current = false;
            setResizePreview(null);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        if (isResizing.current) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', JSON.stringify({ event, type: 'drag' } as DragAndDropElement));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add(s['calendar-week-day--state-drag-over'] ?? '');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(s['calendar-week-day--state-drag-over'] ?? '');
    };

    const getHourFromDropEvent = (e: React.DragEvent<HTMLDivElement>): number => {
        const columnEl = document.querySelector(`[data-guid="calendar-week-${uniqueCalendarId}-day-${toDayKey(day.date)}"]`);
        if (!columnEl) return 0;
        const rect = columnEl.getBoundingClientRect();
        const y = e.clientY - rect.top;
        return Math.floor(y / HOUR_HEIGHT_PX);
    };

    const handleDropTimed = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragLeave(e);

        const data = JSON.parse(e.dataTransfer.getData('text/plain')) as DragAndDropElement;
        if (data.type !== 'drag') return;

        const originalEvent = data.event;
        const startedOn = new Date(originalEvent.startedOn);
        const finishedOn = new Date(originalEvent.finishedOn);
        const durationMs = finishedOn.getTime() - startedOn.getTime();

        if (durationMs >= 24 * 60 * 60 * 1000) return;

        const targetHour = getHourFromDropEvent(e);
        const newStart = new Date(day.date!);
        newStart.setHours(targetHour, 0, 0, 0);
        const newEnd = new Date(newStart.getTime() + durationMs);

        onTimedEventDrop(originalEvent.id, newStart, newEnd);
    };

    const timedEventNodes = (): ReactNode[] => {
        if (!day.date || dayColumnWidth === 0) return [];

        const dayKey = toDayKey(day.date);
        const eventsForDay = timedEvents.filter(e => toDayKey(new Date(e.startedOn)) === dayKey);
        const colMap = computeTimedColumns(eventsForDay);

        const visibleEvents: ReactNode[] = [];
        let hiddenCount = 0;

        for (const event of eventsForDay) {
            const preview = resizePreview?.eventId === event.id ? resizePreview : null;
            const startedOn = preview ? new Date(preview.newStart) : new Date(event.startedOn);
            const finishedOn = preview ? new Date(preview.newEnd) : new Date(event.finishedOn);

            const startHour = startedOn.getHours() + startedOn.getMinutes() / 60;
            const endHour = finishedOn.getHours() + finishedOn.getMinutes() / 60;
            const clampedStart = Math.max(startHour, 0);
            const clampedEnd = Math.min(endHour, 24);
            if (clampedStart >= clampedEnd) continue;

            const { col, totalCols } = colMap.get(event.id) ?? { col: 0, totalCols: 1 };
            const eventWidth = dayColumnWidth / totalCols;

            if (eventWidth < MIN_EVENT_WIDTH_PX) {
                hiddenCount++;
                continue;
            }

            const top = clampedStart * HOUR_HEIGHT_PX;
            const height = (clampedEnd - clampedStart) * HOUR_HEIGHT_PX;
            const left = col * eventWidth;
            const originalEvent = calendarEventsManaged.find(e => e.id === event.id) ?? event;

            visibleEvents.push(
                <div
                    key={`timed-${event.id}-${new Date(event.startedOn).toISOString()}`}
                    className={clsx(
                        s['calendar-week-day__timed-event'],
                        preview ? s['calendar-week-day__timed-event--resizing'] : ''
                    )}
                    style={{ top: `${top}px`, height: `${height}px`, left: `${left + 2}px`, width: `${eventWidth - 4}px` }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, originalEvent)}
                >
                    <div
                        className={s['calendar-week-day__timed-event__resize-handle--top']}
                        onMouseDown={(e) => handleResizeMouseDown(e, originalEvent, 'resize-start')}
                    />
                    <Tooltip title={<>
                        {originalEvent.title}<br />
                        [{`${DatesHelper.toShortLocale(originalEvent.startedOn)} ➡️ ${DatesHelper.toShortLocale(originalEvent.finishedOn)}`}]
                    </>}>
                        <div className={s['calendar-week-day__timed-event__content']}>
                            <span className={s['calendar-week-day__timed-event__time']}>
                                {`${String(startedOn.getHours()).padStart(2, '0')}:${String(startedOn.getMinutes()).padStart(2, '0')}`}
                                {` - `}
                                {`${String(finishedOn.getHours()).padStart(2, '0')}:${String(finishedOn.getMinutes()).padStart(2, '0')}`}
                            </span>
                            <span>{event.title}</span>
                        </div>
                    </Tooltip>
                    <div
                        className={s['calendar-week-day__timed-event__resize-handle--bottom']}
                        onMouseDown={(e) => handleResizeMouseDown(e, originalEvent, 'resize-end')}
                    />
                </div>
            );
        }

        if (hiddenCount > 0) {
            visibleEvents.push(
                <span key={`more-timed-${toDayKey(day.date)}`} className={s['calendar-week-day__more-event']}>
                    +{hiddenCount}
                </span>
            );
        }

        return visibleEvents;
    };

    return (
        <div
            data-guid={`calendar-week-${uniqueCalendarId}-day-${toDayKey(day.date)}`}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDropTimed}
            className={clsx(
                s['calendar-week-day'],
                isToday ? s['calendar-week-day--state-today'] : ''
            )}
            style={{ height: `${24 * HOUR_HEIGHT_PX}px` }}
        >
            {hours.map(h => (
                <div
                    key={`slot-${h}`}
                    className={clsx(
                        s['calendar-week-day__hour-slot'],
                        h < dayStartHour || h >= dayEndHour ? s['calendar-week-day__hour-slot--off-range'] : ''
                    )}
                    style={{ height: `${HOUR_HEIGHT_PX}px` }}
                />
            ))}
            {timedEventNodes()}
        </div>
    );
};

export default CalendarWeekDay;