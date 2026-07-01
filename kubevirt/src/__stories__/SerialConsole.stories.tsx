import type { Meta, StoryObj } from '@storybook/react';
import { SerialConsole } from '../components/SerialConsole';
import { VirtualMachineInstance } from '../resources/VirtualMachineInstance';
import type { KubeVirtVirtualMachineInstance } from '../typedefs';

function mockVmi() {
  const item = new VirtualMachineInstance(
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: {
        name: 'fedora-vm',
        namespace: 'default',
        creationTimestamp: '2026-07-01T00:00:00Z',
      },
      status: { phase: 'Running' },
    } as KubeVirtVirtualMachineInstance,
    'storybook'
  );

  item.serialConsole = onData => {
    window.setTimeout(() => onData('KubeVirt serial console\nlogin: '), 50);

    return {
      cancel: () => {},
      getSocket: () =>
        ({
          readyState: WebSocket.OPEN,
          send: () => {},
        }) as unknown as WebSocket,
    };
  };

  return item;
}

const meta: Meta<typeof SerialConsole> = {
  title: 'KubeVirt/Serial console',
  component: SerialConsole,
};

export default meta;

type Story = StoryObj<typeof SerialConsole>;

export const OpenWithMockStream: Story = {
  args: {
    vmi: mockVmi(),
    open: true,
  },
};
