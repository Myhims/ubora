import type { Meta, StoryObj } from '@storybook/react-vite';
import { CSSProperties } from 'react';
import useDraggable from '../src/hooks/useDraggable';

const DraggableDemo: React.FC = () => {
    const drag1 = useDraggable<HTMLDivElement>({ active: true });
    const drag2 = useDraggable<HTMLDivElement>({ active: false });

    const boxStyles: CSSProperties = {
        width: 120,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        background: 'rgba(var(--uib-color-primary), .2)',
        border: '2px solid rgba(var(--uib-color-primary), .3)',
        color: 'rgb(var(--uib-color-text))',
        fontFamily: 'var(--uib-font-family)',
        userSelect: 'none',
    };

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                padding: '80px',
                boxSizing: 'border-box',
                display: 'flex',
                gap: '2rem',
            }}
        >
            <div
                {...drag2}
                style={{ ...drag2.style, ...boxStyles, opacity: 0.5, cursor: 'not-allowed' }}
            >
                Inactive
            </div>
            <div
                {...drag1}
                style={{ ...drag1.style, ...boxStyles, cursor: 'grab' }}
            >
                Draggable
            </div>
        </div>
    );
};

const meta: Meta<typeof DraggableDemo> = {
    title: 'Hooks/UseDraggable',
    component: DraggableDemo,
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component:
                    'This hook makes an element draggable.',
            },
            source: {
                code: `import React from 'react';
import useDraggable from 'uibora/hooks';

export const MyComponent = () => {
  const drag = useDraggable<HTMLDivElement>({ active: true });

  return (
    <div {...drag}>
      Drag me
    </div>
  );
};`,
            },
            language: 'tsx',
            story: {
                inline: false,
                height: '400px'
            }
        },
    },
};

export default meta;

type Story = StoryObj<typeof DraggableDemo>;

export const Default: Story = {
    render: () => <DraggableDemo />,
};
