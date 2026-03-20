import type { Meta, StoryObj } from '@storybook/react-vite';
import { WeekDay } from '../src/models/WeekDay';
import Calendar from '../src/planner/Calendar/Calendar';

const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const meta = {
  title: 'Planner/Calendar (WIP)',
  component: Calendar,
  parameters: {
    docs: {
      source: {
        transform: (source: string) => {
          const importLine = `import Calendar from 'uibora/planner';`;
          return source.includes('import Calendar') ? source : `${importLine}\n\n${source}`;
        },
        language: 'tsx',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    calendarEvents: [
      { startedOn: new Date(currentYear, currentMonth, 16, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 19, 20, 0, 0), title: 'An event', id: 'event-1' },
      { startedOn: new Date(currentYear, currentMonth, 1, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 1, 20, 0, 0), title: 'Happy birthday', id: 'event-2' },
      { startedOn: new Date(currentYear, currentMonth, 6, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 7, 20, 0, 0), title: 'Training course', id: 'event-3' },
      { startedOn: new Date(currentYear, currentMonth, 7, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 8, 20, 0, 0), title: 'This way', id: 'event-4' },
      { startedOn: new Date(currentYear, currentMonth, 7, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 7, 20, 0, 0), title: 'Rendez-vous', id: 'event-5' },
      { startedOn: new Date(currentYear, currentMonth, 5, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 6, 20, 0, 0), title: 'Scrum', id: 'event-6' },
      { startedOn: new Date(currentYear, currentMonth, 8, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth, 9, 20, 0, 0), title: 'My stuffs', id: 'event-7' },
      { startedOn: new Date(currentYear, currentMonth - 1, 28, 10, 0, 0), finishedOn: new Date(currentYear, currentMonth + 1, 2, 20, 0, 0), title: '2 months long', id: 'event-8' },
    ],
    i18n: {
      sunday: 'S',
      monday: 'M',
      tuesday: 'T',
      wednesday: 'W',
      thursday: 'T',
      friday: 'F',
      saturday: 'S'
    },
    startDayOfWeek: WeekDay.Monday
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultView: Story = {
  args: {
  },
};

