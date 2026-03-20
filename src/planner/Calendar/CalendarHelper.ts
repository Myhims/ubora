import type { WeekDay } from "../../models/WeekDay";
import type { MonthCalendarI18n } from "./i18n/MonthCalendarI18n";
import type { CalendarDay } from "./Models/CalendarDay";
import type { CalendarEvent } from "./Models/CalendarEvent";
import type { EventSegment } from "./Models/EventSegment";

export class CalendarHelper {


    public static getWeekDays(startDay: WeekDay, i18n: MonthCalendarI18n): string[] {
        const days = [
            i18n.sunday,
            i18n.monday,
            i18n.tuesday,
            i18n.wednesday,
            i18n.thursday,
            i18n.friday,
            i18n.saturday
        ];

        // Rotate the array based on the start day
        return [...days.slice(startDay), ...days.slice(0, startDay)];
    }


    /**
         * Returns all days of a given month as an array of Date objects.
         * @param year The year (e.g., 2025)
         * @param month The month (0 = January, 11 = December)
         */
    public static getDaysInMonth(year: number, month: number): Date[] {
        const date = new Date(year, month, 1);
        const days: Date[] = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }


    /**
         * Generates a matrix representing the weeks of the month.
         * Each week contains 7 elements (Date or null).
         * @param year The year (e.g., 2025)
         * @param month The month (0 = January)
         * @param startDayOfWeek The first day of the week
         * @returns A 2D array where each sub-array represents a week.
         */
    public static generateCalendarDays(
        year: number,
        month: number,
        startDayOfWeek: WeekDay
    ): CalendarDay[][] {
        const daysInMonth = this.getDaysInMonth(year, month);
        const firstDayOfWeek = new Date(year, month, 1).getDay();

        // Calculate offset
        let offset = firstDayOfWeek - startDayOfWeek;
        if (offset < 0) offset += 7;

        const weeks: CalendarDay[][] = [];
        let currentWeek: CalendarDay[] = Array(offset).fill({ date: null, isCurrentMonth: false });

        for (const day of daysInMonth) {
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentWeek.push({ date: day, isCurrentMonth: true });
        }

        while (currentWeek.length < 7) {
            currentWeek.push({ date: null, isCurrentMonth: false });
        }
        weeks.push(currentWeek);

        return weeks;
    }

    public static getEventSegments(
        event: CalendarEvent,
        weeks: CalendarDay[][],
    ): EventSegment[] {
        const segments: EventSegment[] = [];

        let segmentCropped = false;

        // Get the first visible date in the calendar
        const firstVisibleDate = weeks[0]?.find(day => day.date !== null)?.date;

        // If the event starts before the first visible date, create a segment starting from the first visible date
        if (firstVisibleDate && event.startedOn < firstVisibleDate) {
            const weekSeg: EventSegment = {
                start: firstVisibleDate.getDate(),
                end: null, // will be completed later
            };
            segments.push(weekSeg);
            segmentCropped = true; // signal that a segment is in progress
        }

        // Iterate over each week
        weeks.map(week => {
            const realWeek = week.filter(w => w.date !== null);
            let lastWeekDate = realWeek[realWeek.length - 1]?.date;
            let weekSeg: EventSegment = { start: null, end: null };

            for (const cell of week) {
                if (cell.date !== null) {
                    if (cell.date.getDate() == event.startedOn.getDate() || segmentCropped) {
                        // If the current date matches the event start or a segment is in progress, set the start
                        weekSeg.start = cell.date.getDate()
                        segmentCropped = false;
                    }
                    // If the current date matches the event end, set the end and push the segment
                    if (cell.date.getDate() == event.finishedOn.getDate()) {
                        weekSeg.end = cell.date.getDate()
                        segments.push({ ...weekSeg });
                        segmentCropped = false;
                    }
                    // If the segment is not finished by the end of the week, crop it and start a new one next week
                    if (weekSeg.start !== null && weekSeg.end === null && lastWeekDate !== null && cell.date.getDate() === lastWeekDate?.getDate()) {
                        weekSeg.end = cell.date.getDate()
                        segments.push({ ...weekSeg });
                        // signal that a new segment should start next week
                        segmentCropped = true;
                    }
                }
            }
        });

        return segments;
    }

    public static MoveEventOn(
        moveTo: CalendarEvent,
        day: CalendarDay,
        sourceMap: CalendarEvent[]
    ): CalendarEvent[] {
        if (!day.date) return sourceMap;

        // Search the event from the source
        const indexToMove = sourceMap.findIndex(e => e.id === moveTo.id);
        if (indexToMove === -1) return sourceMap;

        const eventToMove = sourceMap[indexToMove];

        if (eventToMove === undefined) return sourceMap;

        // get event duration
        const duration = eventToMove.finishedOn.getTime() - eventToMove.startedOn.getTime();

        // Create the nex start based on the day
        const newStart = new Date(day.date);
        const newEnd = new Date(newStart.getTime() + duration);

        // Update the event
        const updatedEvent: CalendarEvent = {
            ...eventToMove,
            startedOn: newStart,
            finishedOn: newEnd
        };

        // Rempalce in the list
        const updatedSourceMap = [...sourceMap];
        updatedSourceMap[indexToMove] = updatedEvent;

        return updatedSourceMap;
    }

    public static ResizeEventOnFromStart(
        moveTo: CalendarEvent,
        day: CalendarDay,
        sourceMap: CalendarEvent[]
    ): CalendarEvent[] {
        if (!day.date) return sourceMap;

        // Search the event from the source
        const indexToMove = sourceMap.findIndex(e => e.id === moveTo.id);
        if (indexToMove === -1) return sourceMap;

        const eventToMove = sourceMap[indexToMove];

        if (eventToMove === undefined) return sourceMap;

        // Create the new start based on the day
        const newStart = new Date(day.date);
        newStart.setHours(eventToMove.startedOn.getHours());
        newStart.setMinutes(eventToMove.startedOn.getMinutes());

        if (newStart > eventToMove.finishedOn)
            return sourceMap;

        // Update the event
        const updatedEvent: CalendarEvent = {
            ...eventToMove,
            startedOn: newStart,
            finishedOn: eventToMove.finishedOn
        };

        // Rempalce in the list
        const updatedSourceMap = [...sourceMap];
        updatedSourceMap[indexToMove] = updatedEvent;

        return updatedSourceMap;
    }

    public static ResizeEventOnFromEnd(
        moveTo: CalendarEvent,
        day: CalendarDay,
        sourceMap: CalendarEvent[]
    ): CalendarEvent[] {
        if (!day.date) return sourceMap;

        // Search the event from the source
        const indexToMove = sourceMap.findIndex(e => e.id === moveTo.id);
        if (indexToMove === -1) return sourceMap;

        const eventToMove = sourceMap[indexToMove];

        if (eventToMove === undefined) return sourceMap;

        // Create the new end based on the day
        const newEnd = new Date(day.date);
        newEnd.setHours(eventToMove.finishedOn.getHours());
        newEnd.setMinutes(eventToMove.finishedOn.getMinutes());

        if (newEnd < eventToMove.startedOn)
            return sourceMap;

        // Update the event
        const updatedEvent: CalendarEvent = {
            ...eventToMove,
            startedOn: eventToMove.startedOn,
            finishedOn: newEnd
        };

        // Replace in the list
        const updatedSourceMap = [...sourceMap];
        updatedSourceMap[indexToMove] = updatedEvent;

        return updatedSourceMap;
    }

    public static FilterEventsForMonth(
        events: CalendarEvent[],
        displayedMonth: Date
    ): CalendarEvent[] {
        const monthStart = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
        const monthEnd = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0, 23, 59, 59, 999);

        return events.filter(ce =>
            ce.startedOn <= monthEnd && ce.finishedOn >= monthStart
        );


    }

    public static ClipAndSortEventsForMonth(events: CalendarEvent[], monthStart: Date, monthEnd: Date): CalendarEvent[] {
        return events
            .map(event => {
                const clippedStart = event.startedOn < monthStart ? monthStart : event.startedOn;
                const clippedEnd = event.finishedOn > monthEnd ? monthEnd : event.finishedOn;
                return { ...event, startedOn: clippedStart, finishedOn: clippedEnd };
            })
            .filter(event => event.startedOn.getTime() <= event.finishedOn.getTime())
            .sort((a, b) => {
                const startDiff = a.startedOn.getTime() - b.startedOn.getTime();
                if (startDiff !== 0) return startDiff;
                return a.finishedOn.getTime() - b.finishedOn.getTime();
            });
    }
}
