import type { Meta, StoryObj } from '@storybook/react-vite';
import FunBubble from '../src/simple/FunBubble';

const meta: Meta<typeof FunBubble> = {
  title: 'Simple/Fun Bubble',
  component: FunBubble,
  tags: ['autodocs'],
  parameters: {
    docs: {
      source: {
        transform: (source: string) => {
          const importLine = `import FunBubble from 'uibora/simple';`;
          return source.includes('import FunBubble') ? source : `${importLine}\n\n${source}`;
        },
        language: 'tsx',
      },
    },
  },
  argTypes: {
  }
};

export default meta;
type Story = StoryObj<typeof FunBubble>;

export const Default: Story = {
  args: {
    children: "Hello, how are you today ?"
  },
};

export const Many: Story = {
  render: (args) => {
    return <div style={{ display: 'flex', gap: '1.5rem', padding: '2rem' }}>
            <FunBubble size="sm">Hello</FunBubble>
            <FunBubble size="md" color="rgb(var(--uib-color-error))">Hello there !</FunBubble>
            <FunBubble size="lg">Hello</FunBubble>

            <FunBubble size="md" variant="contained" color="rgb(var(--uib-color-primary))">
                Hello
            </FunBubble>

            <FunBubble size="md" variant="light" >
                Hello
            </FunBubble>
        </div>
  },
};