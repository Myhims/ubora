import clsx from "clsx"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import ReactDOM from 'react-dom'
import { v4 as uuidv4 } from 'uuid'
import { DatesHelper } from "../../helpers/DatesHelper"
import { WeekDay } from "../../models/WeekDay"
import { Tooltip } from "../../simple"
import { CalendarHelper } from "./CalendarHelper"
import s from './CalendarMonth.module.scss'
import type { CalendarDay } from "./Models/CalendarDay"
import type { CalendarEvent } from "./Models/CalendarEvent"
import type { MonthCalendarI18n } from "./i18n/MonthCalendarI18n"

export interface ICalendarMonthProps {
    startDayOfWeek: WeekDay
    startDate: Date
    calendarEvents: CalendarEvent[]
    i18n: MonthCalendarI18n
}

type DragAndDropElement = {
    event: CalendarEvent
    type: 'drag' | 'resize-start' | 'resize-end'
}

const CalendarMonth = ({
    startDayOfWeek = WeekDay.Sunday,
    startDate = new Date(),
    calendarEvents = [],
    i18n
}: ICalendarMonthProps) => {
    const [calendarInDays, setCalendarInDays] = useState<CalendarDay[][]>();
    const [eventsPortals, setEventsPortals] = useState<React.ReactPortal[]>([]);
    const [calendarEventsManaged, setCalendarEventsManaged] = useState<CalendarEvent[]>(CalendarHelper.FilterEventsForMonth(calendarEvents, startDate));
    const [dragPreview, setDragPreview] = useState<CalendarEvent[] | null>(null);
    const dragDataRef = useRef<DragAndDropElement | null>(null);

    const displayEvents = dragPreview ?? calendarEventsManaged;

    const monthStart = useMemo(() => {
        return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }, [startDate]);

    const monthEnd = useMemo(() => {
        return new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    }, [startDate]);

    const toDayKey = useCallback((date?: Date | null) => {
        if (!date) return '';
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }, []);

    const addDays = useCallback((date: Date, days: number) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }, []);

    useEffect(() => {
        const displayDays = CalendarHelper.generateCalendarDays(startDate.getFullYear(), startDate.getMonth(), startDayOfWeek);
        setCalendarInDays(displayDays);
    }, [startDate, startDayOfWeek]);

    useEffect(() => {
        setCalendarEventsManaged(CalendarHelper.FilterEventsForMonth(calendarEvents, startDate));
    }, [calendarEvents, startDate]);

    const uniqueCalendarId = useMemo(() => {
        return uuidv4();
    }, [])

    const headerDays = useMemo(() => {
        const days = CalendarHelper.getWeekDays(startDayOfWeek, i18n);
        return <div className={s['calendar-month__header']}>
            {days.map((d, i) => {
                return <div className={s['calendar-month__header__day']} key={`cmhd-${d}-${i}`}>
                    {d}
                </div>
            })}
        </div>
    }, [startDayOfWeek, i18n])

    /* Drag and Drop */
    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        const data: DragAndDropElement = { event, type: 'drag' };
        e.dataTransfer.setData('text/plain', JSON.stringify(data));
        dragDataRef.current = data;
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, day: CalendarDay) => {
        e.preventDefault();
        e.currentTarget.classList.add(s['calendar-month__week-line__single-day--state-drag-over'] ?? '');

        if (!dragDataRef.current || !day.date) return;

        const data = dragDataRef.current;
        let previewEvents: CalendarEvent[];

        switch (data.type) {
            case 'drag':
                previewEvents = CalendarHelper.MoveEventOn(data.event, day, calendarEventsManaged);
                break;
            case 'resize-start':
                previewEvents = CalendarHelper.ResizeEventOnFromStart(data.event, day, calendarEventsManaged);
                break;
            case 'resize-end':
                previewEvents = CalendarHelper.ResizeEventOnFromEnd(data.event, day, calendarEventsManaged);
                break;
            default:
                return;
        }

        setDragPreview(previewEvents);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(s['calendar-month__week-line__single-day--state-drag-over'] ?? '');
    };

    const handleDragEnd = useCallback(() => {
        dragDataRef.current = null;
        setDragPreview(null);
    }, []);

    const handleDropResize = useCallback((e: React.DragEvent<HTMLDivElement>, day: CalendarDay) => {
        e.preventDefault();
        dragAndDropDraw(e, day);
    }, [calendarEventsManaged]);

    const dragAndDropDraw = useCallback((e: React.DragEvent<HTMLDivElement>, day: CalendarDay) => {
        e.preventDefault();

        let newEvents: CalendarEvent[] = [...calendarEventsManaged];
        const data = JSON.parse(e.dataTransfer.getData('text/plain')) as DragAndDropElement;

        switch (data.type) {
            case 'drag':
                newEvents = CalendarHelper.MoveEventOn(data.event, day, calendarEventsManaged);
                break;
            case "resize-start":
                newEvents = CalendarHelper.ResizeEventOnFromStart(data.event, day, calendarEventsManaged);
                break;
            case "resize-end":
                newEvents = CalendarHelper.ResizeEventOnFromEnd(data.event, day, calendarEventsManaged);
                break;
        }

        setCalendarEventsManaged(newEvents);
        setDragPreview(null);
        dragDataRef.current = null;
        handleDragLeave(e);
    }, [calendarEventsManaged]);

    /* Resize */
    const handleResizeStart = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        const data: DragAndDropElement = { event, type: 'resize-start' };
        e.dataTransfer.setData('text/plain', JSON.stringify(data));
        dragDataRef.current = data;
    }, []);

    const handleResizeEnd = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        const data: DragAndDropElement = { event, type: 'resize-end' };
        e.dataTransfer.setData('text/plain', JSON.stringify(data));
        dragDataRef.current = data;
    }, []);

    /* Events display */
    const monthEvents = (
        day: CalendarDay,
        eventsAmountByDay: { dayKey: string, amount: number }[],
        maxHeight: number | undefined
    ) => {
        const events: ReactNode[] = [];

        if (calendarInDays === undefined || day.date === null || !day.isCurrentMonth)
            return events;

        const sortedEvents = CalendarHelper.ClipAndSortEventsForMonth(displayEvents, monthStart, monthEnd);

        let moreEvents = 0;

        for (const event of sortedEvents) {
            const segments = CalendarHelper.getEventSegments(event, calendarInDays);

            for (const daySeg of segments) {
                if (daySeg.start === day.date.getDate() && daySeg.end !== null) {
                    const size = daySeg.end - daySeg.start + 1;

                    let minimalDayAmount = 1;

                    for (let i = 0; i < size; i++) {
                        const currentDate = addDays(day.date, i);
                        const currentDayKey = toDayKey(currentDate);
                        const dayAmount = eventsAmountByDay.find(d => d.dayKey === currentDayKey);

                        if (dayAmount) {
                            dayAmount.amount++;
                            minimalDayAmount = dayAmount.amount;
                        } else {
                            eventsAmountByDay.push({ dayKey: currentDayKey, amount: minimalDayAmount });
                        }
                    }

                    const eventsOfDay = eventsAmountByDay.find(d => d.dayKey === toDayKey(day.date))?.amount ?? 0;

                    const originalEvent = calendarEventsManaged.find(e => e.id === event.id) ?? event;
                    const isDragging = dragDataRef.current?.event.id === event.id;

                    if (maxHeight && ((eventsOfDay + 1) * 25) < maxHeight) {
                        events.push(
                            <div
                                key={`event-${event.title}-${event.startedOn.toISOString()}-${event.finishedOn.toISOString()}`}
                                style={{ width: `calc(${size * 100}% - 4px)`, top: `${(eventsOfDay - 1) * 25}px` }}
                                className={clsx(
                                    s['calendar-month__event'],
                                    isDragging ? s['calendar-month__event--dragging'] : ''
                                )}
                            >
                                <div
                                    className={s['calendar-month__event__resizer-left']}
                                    draggable
                                    onDragStart={(e) => handleResizeStart(e, originalEvent)}
                                    onDragEnd={handleDragEnd}
                                />

                                <div
                                    className={s['calendar-month__event__content']}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, originalEvent)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <Tooltip title={<>
                                        {originalEvent.title}
                                        <br />
                                        [{`${DatesHelper.toShortLocale(originalEvent.startedOn)} ➡️ ${DatesHelper.toShortLocale(originalEvent.finishedOn)}`}]
                                    </>}>
                                        <div>{originalEvent.title}</div>
                                    </Tooltip>
                                </div>

                                <div
                                    className={s['calendar-month__event__resizer-right']}
                                    draggable
                                    onDragStart={(e) => handleResizeEnd(e, originalEvent)}
                                    onDragEnd={handleDragEnd}
                                />
                            </div>
                        );
                    } else {
                        moreEvents++;
                    }
                }
            }
        }

        if (moreEvents > 0) {
            events.push(
                <span
                    key={`more-${toDayKey(day.date)}`}
                    className={s["calendar-month__week-line__single-day__more-event"]}
                >
                    +{moreEvents}
                </span>
            );
        }

        return events;
    }

    const showCalendarDays = useMemo(() => {
        const today = new Date();
        const todayKey = toDayKey(today);

        return calendarInDays?.map((weeks, i) => {
            return <div key={`day-${i}`}
                className={s["calendar-month__week-line"]}
            >
                {weeks.map((day, index) => {
                    const dandProps = day.isCurrentMonth ? {
                        onDragOver: (e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, day),
                        onDrop: (e: React.DragEvent<HTMLDivElement>) => handleDropResize(e, day)
                    } : {}

                    return <div
                        data-guid={`calendar-month-${uniqueCalendarId}-day-${toDayKey(day.date)}`}
                        key={`day-${toDayKey(day.date)}-${index}`}
                        onDragLeave={handleDragLeave}
                        {...dandProps}
                        className={clsx(
                            s["calendar-month__week-line__single-day"],
                            day.isCurrentMonth ? '' : s["calendar-month__week-line__single-day--state-disabled"],
                            toDayKey(day.date) === todayKey ? s["calendar-month__week-line__single-day--state-today"] : ''
                        )}>
                        {day.date?.getDate()}
                    </div>
                })}
            </div>
        })
    }, [calendarInDays, calendarEventsManaged, handleDropResize, toDayKey, uniqueCalendarId]);

    const appendEvents = () => {
        const eventsAmountByDay: { dayKey: string, amount: number }[] = [];
        const newPortals: React.ReactPortal[] = [];

        calendarInDays?.forEach((weeks) => {
            weeks
                .filter(d => d.date !== null && d.isCurrentMonth)
                .forEach((day) => {
                    const dataGuid = `calendar-month-${uniqueCalendarId}-day-${toDayKey(day.date)}`;
                    const dayCase = document.querySelector(`[data-guid="${dataGuid}"]`);
                    const events = monthEvents(day, eventsAmountByDay, (dayCase as HTMLDivElement | null)?.clientHeight);

                    if (dayCase) {
                        newPortals.push(ReactDOM.createPortal(events, dayCase));
                    }
                });
        });

        setEventsPortals(newPortals);
    }

    useLayoutEffect(() => {
        const handleResize = () => {
            appendEvents();
        };

        appendEvents();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [showCalendarDays, calendarEventsManaged, dragPreview]);

    return <>
        {headerDays}
        {showCalendarDays}
        {eventsPortals}
    </>
}

export default CalendarMonth