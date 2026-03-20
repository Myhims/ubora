import clsx from "clsx"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import ReactDOM from 'react-dom'
import { v4 as uuidv4 } from 'uuid'
import { DatesHelper } from "../../helpers/DatesHelper"
import { WeekDay } from "../../models/WeekDay"
import { Tooltip } from "../../simple"
import { CalendarHelper } from "./CalendarHelper"
import s from './CalendarWeek.module.scss'
import CalendarWeekDay from "./CalendarWeekDay"
import type { CalendarDay } from "./Models/CalendarDay"
import type { CalendarEvent } from "./Models/CalendarEvent"
import type { MonthCalendarI18n } from "./i18n/MonthCalendarI18n"

export interface ICalendarWeekProps {
    startDayOfWeek?: WeekDay
    startDate?: Date
    calendarEvents?: CalendarEvent[]
    i18n: MonthCalendarI18n
    /** Heure de début de la journée affichée (0-23), défaut: 0 */
    dayStartHour?: number
    /** Heure de fin de la journée affichée (1-24), défaut: 24 */
    dayEndHour?: number
}

type DragAndDropElement = {
    event: CalendarEvent
    type: 'drag' | 'resize-start' | 'resize-end'
}

const HOUR_HEIGHT_PX = 60;
const GUTTER_WIDTH = 50;
const MIN_EVENT_WIDTH_PX = 30;

const CalendarWeek = ({
    startDayOfWeek = WeekDay.Sunday,
    startDate = new Date(),
    calendarEvents = [],
    i18n,
    dayStartHour = 0,
    dayEndHour = 24,
}: ICalendarWeekProps) => {
    const [eventsPortals, setEventsPortals] = useState<React.ReactPortal[]>([]);
    const [calendarEventsManaged, setCalendarEventsManaged] = useState<CalendarEvent[]>(
        CalendarHelper.FilterEventsForWeek(calendarEvents, startDate, startDayOfWeek)
    );
    const [dayColumnWidth, setDayColumnWidth] = useState(0);
    const gridRef = useRef<HTMLDivElement>(null);

    const weekStart = useMemo(() => CalendarHelper.getWeekStart(startDate, startDayOfWeek), [startDate, startDayOfWeek]);
    const weekEnd = useMemo(() => CalendarHelper.getWeekEnd(startDate, startDayOfWeek), [startDate, startDayOfWeek]);

    const weekDays = useMemo((): CalendarDay[] => {
        const days: CalendarDay[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            days.push({ date, isCurrentMonth: true });
        }
        return days;
    }, [weekStart]);

    const hours = useMemo(() => {
        const h: number[] = [];
        for (let i = 0; i < 24; i++) h.push(i);
        return h;
    }, []);

    const toDayKey = useCallback((date?: Date | null) => {
        if (!date) return '';
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }, []);

    const addDays = useCallback((date: Date, days: number) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + days);
        return nextDate;
    }, []);

    // ✅ ResizeObserver pour avoir dayColumnWidth dès le premier rendu
    useLayoutEffect(() => {
        if (!gridRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const totalWidth = entry.contentRect.width - GUTTER_WIDTH;
                setDayColumnWidth(totalWidth / 7);
            }
        });

        observer.observe(gridRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setCalendarEventsManaged(CalendarHelper.FilterEventsForWeek(calendarEvents, startDate, startDayOfWeek));
    }, [calendarEvents, startDate, startDayOfWeek]);

    const uniqueCalendarId = useMemo(() => uuidv4(), []);

    const { allDayEvents, timedEvents } = useMemo(() => {
        const allDay: CalendarEvent[] = [];
        const timed: CalendarEvent[] = [];
        calendarEventsManaged.forEach(event => {
            const diffMs = new Date(event.finishedOn).getTime() - new Date(event.startedOn).getTime();
            if (diffMs >= 24 * 60 * 60 * 1000) allDay.push(event);
            else timed.push(event);
        });
        return { allDayEvents: allDay, timedEvents: timed };
    }, [calendarEventsManaged]);

    const headerDays = useMemo(() => {
        const dayLabels = CalendarHelper.getWeekDays(startDayOfWeek, i18n);
        return (
            <div className={s['calendar-week__header']}>
                <div className={s['calendar-week__header__gutter']} />
                {weekDays.map((day, i) => (
                    <div className={s['calendar-week__header__day']} key={`cwhd-${i}`}>
                        <span className={s['calendar-week__header__day__label']}>{dayLabels[i]}</span>
                        <span className={s['calendar-week__header__day__number']}>{day.date?.getDate()}</span>
                    </div>
                ))}
            </div>
        );
    }, [startDayOfWeek, i18n, weekDays]);

    /* Drag and Drop */
    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ event, type: 'drag' } as DragAndDropElement));
    }, []);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add(s['calendar-week__day--state-drag-over'] ?? '');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(s['calendar-week__day--state-drag-over'] ?? '');
    };

    // ✅ Calcule l'heure cible à partir de la position Y du drop dans la cellule
    const getHourFromDropEvent = (e: React.DragEvent<HTMLDivElement>): number => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        return Math.floor(y / HOUR_HEIGHT_PX);
    };

    const handleDropTimed = useCallback((eventId: string, newStart: Date, newEnd: Date) => {
        setCalendarEventsManaged(prev =>
            prev.map(ev =>
                ev.id === eventId
                    ? { ...ev, startedOn: newStart, finishedOn: newEnd }
                    : ev
            )
        );
    }, []);

    const handleDropResize = useCallback((e: React.DragEvent<HTMLDivElement>, day: CalendarDay) => {
        e.preventDefault();
        e.stopPropagation(); // ✅ empêche la propagation
        handleDragLeave(e);

        const data = JSON.parse(e.dataTransfer.getData('text/plain')) as DragAndDropElement;

        const diffMs = new Date(data.event.finishedOn).getTime() - new Date(data.event.startedOn).getTime();
        if (data.type === 'drag' && diffMs < 24 * 60 * 60 * 1000) return; // géré par handleDropTimed

        setCalendarEventsManaged(prev => {
            let newEvents = [...prev];
            switch (data.type) {
                case 'drag':
                    newEvents = CalendarHelper.MoveEventOn(data.event, day, prev);
                    break;
                case 'resize-start':
                    newEvents = CalendarHelper.ResizeEventOnFromStart(data.event, day, prev);
                    break;
                case 'resize-end':
                    newEvents = CalendarHelper.ResizeEventOnFromEnd(data.event, day, prev);
                    break;
            }
            return newEvents;
        });
    }, []);

    const handleResizeStart = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ event, type: 'resize-start' } as DragAndDropElement));
    }, []);

    const handleResizeEnd = useCallback((e: React.DragEvent<HTMLDivElement>, event: CalendarEvent) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ event, type: 'resize-end' } as DragAndDropElement));
    }, []);

    /* Calcule les colonnes pour les events qui se chevauchent */
    const computeTimedColumns = (events: CalendarEvent[]): Map<string, { col: number, totalCols: number }> => {
        const result = new Map<string, { col: number, totalCols: number }>();
        if (events.length === 0) return result;

        // Trier par heure de début
        const sorted = [...events].sort((a, b) =>
            new Date(a.startedOn).getTime() - new Date(b.startedOn).getTime()
        );

        // Grouper les événements qui se chevauchent
        const groups: CalendarEvent[][] = [];
        let currentGroup: CalendarEvent[] = [];

        for (const event of sorted) {
            if (currentGroup.length === 0) {
                currentGroup.push(event);
            } else {
                // Vérifie si l'event chevauche au moins un event du groupe courant
                const overlaps = currentGroup.some(e =>
                    new Date(event.startedOn) < new Date(e.finishedOn) &&
                    new Date(event.finishedOn) > new Date(e.startedOn)
                );
                if (overlaps) {
                    currentGroup.push(event);
                } else {
                    groups.push(currentGroup);
                    currentGroup = [event];
                }
            }
        }
        if (currentGroup.length > 0) groups.push(currentGroup);

        // Pour chaque groupe, assigner les colonnes par slot disponible
        for (const group of groups) {
            const cols: (CalendarEvent | null)[] = [];

            for (const event of group) {
                // Trouver la première colonne libre
                let placed = false;
                for (let c = 0; c < cols.length; c++) {
                    const occupant = cols[c];
                    if (!occupant || new Date(event.startedOn) >= new Date(occupant.finishedOn)) {
                        cols[c] = event;
                        result.set(event.id, { col: c, totalCols: 0 }); // totalCols sera mis à jour
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    cols.push(event);
                    result.set(event.id, { col: cols.length - 1, totalCols: 0 });
                }
            }

            // Mettre à jour totalCols pour tous les events du groupe
            const totalCols = cols.length;
            for (const event of group) {
                const entry = result.get(event.id);
                if (entry) entry.totalCols = totalCols;
            }
        }

        return result;
    };
    
    /* All-day events (portals) */
    const allDayWeekEvents = (
        day: CalendarDay,
        eventsAmountByDay: { dayKey: string, amount: number }[],
        maxHeight: number | undefined
    ) => {
        const events: ReactNode[] = [];
        if (!day.date) return events;

        const sortedEvents = CalendarHelper.ClipAndSortEventsForMonth(allDayEvents, weekStart, weekEnd);
        let moreEvents = 0;

        for (const event of sortedEvents) {
            const eventStartKey = toDayKey(event.startedOn);
            const dayKey = toDayKey(day.date);
            if (eventStartKey !== dayKey) continue;

            const diffMs = event.finishedOn.getTime() - event.startedOn.getTime();
            const size = Math.min(
                Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1,
                7 - weekDays.findIndex(d => toDayKey(d.date) === dayKey)
            );

            for (let i = 0; i < size; i++) {
                const currentDayKey = toDayKey(addDays(day.date, i));
                const dayAmount = eventsAmountByDay.find(d => d.dayKey === currentDayKey);
                if (dayAmount) dayAmount.amount++;
                else eventsAmountByDay.push({ dayKey: currentDayKey, amount: 1 });
            }

            const eventsOfDay = eventsAmountByDay.find(d => d.dayKey === toDayKey(day.date))?.amount ?? 0;
            const originalEvent = calendarEventsManaged.find(e => e.id === event.id) ?? event;

            if (!maxHeight || ((eventsOfDay + 1) * 25) < maxHeight) {
                events.push(
                    <div
                        key={`allday-event-${event.id}-${event.startedOn.toISOString()}`}
                        style={{ width: `calc(${size * 100}% - 4px)`, top: `${(eventsOfDay - 1) * 25}px` }}
                        className={s['calendar-week__event']}
                    >
                        <div className={s['calendar-week__event__resizer-left']} draggable onDragStart={(e) => handleResizeStart(e, originalEvent)} />
                        <div className={s['calendar-week__event__content']} draggable onDragStart={(e) => handleDragStart(e, originalEvent)}>
                            <Tooltip title={<>
                                {originalEvent.title}<br />
                                [{`${DatesHelper.toShortLocale(originalEvent.startedOn)} ➡️ ${DatesHelper.toShortLocale(originalEvent.finishedOn)}`}]
                            </>}>
                                <div>{originalEvent.title}</div>
                            </Tooltip>
                        </div>
                        <div className={s['calendar-week__event__resizer-right']} draggable onDragStart={(e) => handleResizeEnd(e, originalEvent)} />
                    </div>
                );
            } else {
                moreEvents++;
            }
        }

        if (moreEvents > 0) {
            events.push(
                <span key={`more-${toDayKey(day.date)}`} className={s['calendar-week__day__more-event']}>
                    +{moreEvents}
                </span>
            );
        }

        return events;
    };

    const allDayRow = useMemo(() => (
        <div className={s['calendar-week__allday-row']}>
            <div className={s['calendar-week__allday-row__gutter']}>
                <span>All day</span>
            </div>
            {weekDays.map((day, index) => (
                <div
                    data-guid={`calendar-week-${uniqueCalendarId}-allday-${toDayKey(day.date)}`}
                    key={`allday-${toDayKey(day.date)}-${index}`}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropResize(e, day)}
                    className={s['calendar-week__allday-row__day']}
                />
            ))}
        </div>
    ), [weekDays, uniqueCalendarId, toDayKey, handleDropResize]);

    const showCalendarDays = useMemo(() => {
        const today = new Date();
        const todayKey = toDayKey(today);

        return (
            <div className={s['calendar-week__grid']} ref={gridRef}>
                <div className={s['calendar-week__gutter']}>
                    {hours.map(h => (
                        <div
                            key={`hour-${h}`}
                            className={clsx(
                                s['calendar-week__gutter__hour'],
                                h < dayStartHour || h >= dayEndHour ? s['calendar-week__gutter__hour--off-range'] : ''
                            )}
                            style={{ height: `${HOUR_HEIGHT_PX}px` }}
                        >
                            {`${String(h).padStart(2, '0')}:00`}
                        </div>
                    ))}
                </div>

                {weekDays.map((day, index) => (
                    <CalendarWeekDay
                        key={`day-${toDayKey(day.date)}-${index}`}
                        day={day}
                        hours={hours}
                        dayStartHour={dayStartHour}
                        dayEndHour={dayEndHour}
                        timedEvents={timedEvents}
                        calendarEventsManaged={calendarEventsManaged}
                        dayColumnWidth={dayColumnWidth}
                        uniqueCalendarId={uniqueCalendarId}
                        isToday={toDayKey(day.date) === todayKey}
                        toDayKey={toDayKey}
                        onTimedEventDrop={handleDropTimed}
                    />
                ))}
            </div>
        );
    }, [weekDays, hours, timedEvents, calendarEventsManaged, dayColumnWidth, uniqueCalendarId,
        toDayKey, handleDropTimed, dayStartHour, dayEndHour]);

    const appendAllDayEvents = useCallback(() => {
        const eventsAmountByDay: { dayKey: string, amount: number }[] = [];
        const newPortals: React.ReactPortal[] = [];

        weekDays.forEach((day) => {
            const dataGuid = `calendar-week-${uniqueCalendarId}-allday-${toDayKey(day.date)}`;
            const dayCase = document.querySelector(`[data-guid="${dataGuid}"]`);
            const events = allDayWeekEvents(day, eventsAmountByDay, (dayCase as HTMLDivElement | null)?.clientHeight);
            if (dayCase) newPortals.push(ReactDOM.createPortal(events, dayCase));
        });

        setEventsPortals(newPortals);
    }, [weekDays, allDayEvents, uniqueCalendarId, toDayKey]);

    useLayoutEffect(() => {
        appendAllDayEvents();
        window.addEventListener('resize', appendAllDayEvents);
        return () => window.removeEventListener('resize', appendAllDayEvents);
    }, [appendAllDayEvents]);

    const scrollRef = useCallback((node: HTMLDivElement | null) => {
        if (node) node.scrollTop = dayStartHour * HOUR_HEIGHT_PX;
    }, [dayStartHour]);

    return (
        <div className={s['calendar-week']}>
            {headerDays}
            {allDayRow}
            {eventsPortals}
            <div className={s['calendar-week__scroll']} ref={scrollRef}>
                {showCalendarDays}
            </div>
        </div>
    );
}

export default CalendarWeek;