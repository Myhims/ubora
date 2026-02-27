import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import Button from '../src/buttons/Button';
import Modal, { ModalVariant } from '../src/modals/Modal';

const meta: Meta<typeof Modal> = {
  title: 'Modals/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'This hook makes any element keyboard-accessible and adds a ripple effect on click, focus, or keyboard activation (Enter/Space).',
      },
      source: {
        code: `import React from 'react';
import Modal from 'uibora/modals;

export const MyComponent = () => {
  const [open, setOpen] = useState<boolean>(false);

  return <>
    <Button
      onClick={() => { setOpen(true) }}
    >Launch demo modal</Button>
    <Modal isOpen={open} onToggled={(v) => setOpen(v)}>
      <Modal.Header>My awesome modal</Modal.Header>
      <Modal.Body>You're reading this text in a modal!</Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  </>
}`
      },
      language: 'tsx',
    },
    story: {
      height: '400px'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Modal>;

const SampleNode = () => {
  const [open, setOpen] = useState<boolean>(false);

  return <>
    <Button
      onClick={() => { setOpen(true) }}
    >Launch demo modal</Button>
    <Modal isOpen={open} onToggled={(v) => setOpen(v)} variant={ModalVariant.ToTop}>
      <Modal.Header>My awesome modal</Modal.Header>
      <Modal.Body>
        <img src="https://uneimage.fr/photos/jeunes_panthere_des_neiges_.JPG" width="400"
          style={{ float: 'right', padding: '0 0 2em 2em' }}></img>Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.<br /><br />
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br />
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br /><br />
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,<br />
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.<br />
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,<br />
        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.<br /><br />
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,<br />
        consectetur, adipisci velit, <br />
        sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.<br /><br />
        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,<br />
        nisi ut aliquid ex ea commodi consequatur?<br />
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,<br />
        vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?<br /><br />
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br /><br />
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,<br />
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.<br />
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,<br />
        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.<br /><br />
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,<br />
        consectetur, adipisci velit, <br />
      </Modal.Body>
      <Modal.Footer>
        <i style={{ display: 'flex', justifyContent: 'end' }}>My custom footer</i>
      </Modal.Footer>
    </Modal>
  </>
}

const SlidingNode = () => {
  const [open, setOpen] = useState<boolean>(false);

  return <>
    <Button
      onClick={() => { setOpen(true) }}
    >Launch demo modal</Button>
    <Modal isOpen={open} onToggled={(v) => setOpen(v)} variant={ModalVariant.Slide}>
      <Modal.Header>My awesome modal</Modal.Header>
      <Modal.Body>
        <img src="https://uneimage.fr/photos/jeunes_panthere_des_neiges_.JPG" width="400"
          style={{ float: 'right', padding: '0 0 2em 2em' }}></img>Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.<br /><br />
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br />
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br /><br />
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,<br />
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.<br />
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,<br />
        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.<br /><br />
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,<br />
        consectetur, adipisci velit, <br />
        sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.<br /><br />
        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,<br />
        nisi ut aliquid ex ea commodi consequatur?<br />
        Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur,<br />
        vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?<br /><br />
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br /><br />
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,<br />
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.<br />
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,<br />
        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.<br /><br />
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,<br />
        consectetur, adipisci velit, <br />
      </Modal.Body>
      <Modal.Footer>
        <i style={{ display: 'flex', justifyContent: 'end' }}>My custom footer</i>
      </Modal.Footer>
    </Modal>
  </>
}

const FullNode = () => {
  const [open, setOpen] = useState<boolean>(false);

  return <>
    <Button
      onClick={() => { setOpen(true) }}
    >Launch demo modal</Button>
    <Modal isOpen={open} onToggled={(v) => setOpen(v)} variant={ModalVariant.FullScreen}>
      <Modal.Header>My awesome modal</Modal.Header>
      <Modal.Body>
        <img src="https://uneimage.fr/photos/jeunes_panthere_des_neiges_.JPG" width="400"
          style={{ float: 'right', padding: '0 0 2em 2em' }}></img>Lorem ipsum dolor sit amet, consectetur adipiscing elit,<br />
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.<br /><br />
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.<br />
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <br /><br />
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br /><br />
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,<br />
        totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.<br />
        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,<br />
        sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.<br /><br />
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,<br />
      </Modal.Body>
      <Modal.Footer>
        <i style={{ display: 'flex', justifyContent: 'end' }}>My custom footer</i>
      </Modal.Footer>
    </Modal>
  </>
}

export const Sample: Story = {
  render: (args) => {
    return <SampleNode />
  },
};

export const Sliding: Story = {
  render: (args) => {
    return <SlidingNode />
  },
};


export const Full: Story = {
  render: (args) => {
    return <FullNode />
  },
};