import clsx from "clsx";
import { useState, type HtmlHTMLAttributes } from "react";
import { ButtonSize } from "../../buttons/models/ButtonSize";
import SplitButton from "../../buttons/SplitButton";
import { WeekDay } from "../../models/WeekDay";
import s from './Calendar.module.scss';
import CalendarMonth from "./CalendarMonth";
import CalendarWeek from "./CalendarWeek";
import type { MonthCalendarI18n } from "./i18n/MonthCalendarI18n";
import type { CalendarEvent } from "./Models/CalendarEvent";

export type CalendarI18n = MonthCalendarI18n & {};

interface ICalendarProps extends HtmlHTMLAttributes<HTMLDivElement> {
    startDayOfWeek?: WeekDay
    defautlDisplayMode?: 'month' | 'week' | 'day'
    startDay?: Date
    calendarEvents?: CalendarEvent[]
    i18n: CalendarI18n
    /** Heure de début de la journée affichée (0-23), défaut: 0 */
    dayStartHour?: number
    /** Heure de fin de la journée affichée (1-24), défaut: 24 */
    dayEndHour?: number
}


const Calendar = ({
    startDayOfWeek = WeekDay.Sunday,
    defautlDisplayMode = 'month',
    startDay = new Date(),
    calendarEvents = [],
    className,
    dayStartHour,
    dayEndHour,
    i18n,
    ...props
}: ICalendarProps) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    return <div className={clsx(s.calendar, className)} {...props}>
        <div className={s['calendar__mode-selector']}>
            <SplitButton
                activeTab={activeTab}
                className="custom"
                size={ButtonSize.small}
            >
                <SplitButton.Action title="Month" onClick={() => setActiveTab(0)} />
                <SplitButton.Action title="Week" onClick={() => setActiveTab(1)} />
                <SplitButton.Action title="Day" onClick={() => setActiveTab(2)} />
            </SplitButton>
        </div>
        {activeTab === 0 &&
            <Calendar.Month
                startDayOfWeek={startDayOfWeek}
                startDate={startDay}
                calendarEvents={calendarEvents}
                i18n={i18n}
            />
        }
        {activeTab === 1 &&
            <Calendar.Week
                startDayOfWeek={startDayOfWeek}
                startDate={startDay}
                dayStartHour={dayStartHour}
                dayEndHour={dayEndHour}
                calendarEvents={calendarEvents}
                i18n={i18n}
            />
        }
    </div>
}

Calendar.Month = CalendarMonth;
(Calendar.Month as any).displayName = 'Calendar.Month';

Calendar.Week = CalendarWeek;
(Calendar.Week as any).displayName = 'Calendar.Week';

export default Calendar;