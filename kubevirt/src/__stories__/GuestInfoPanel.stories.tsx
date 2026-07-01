import type { Meta, StoryObj } from '@storybook/react';
import { GuestInfoPanel } from '../modules/virtualmachineinstance/GuestInfoPanel';
import { VirtualMachineInstance } from '../resources/VirtualMachineInstance';
import type { KubeVirtVirtualMachineInstance } from '../typedefs';

function guestInfoVmi(connected: boolean) {
  const item = new VirtualMachineInstance(
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: {
        name: 'fedora-vm',
        namespace: 'default',
        creationTimestamp: '2026-07-01T00:00:00Z',
      },
      status: {
        phase: 'Running',
        conditions: connected ? [{ type: 'AgentConnected', status: 'True', lastProbeTime: null }] : [],
      },
    } as KubeVirtVirtualMachineInstance,
    'storybook'
  );

  item.guestOsInfo = () =>
    Promise.resolve({
      guestAgentVersion: '1.2.3',
      hostname: 'fedora-vm',
      timezone: 'UTC',
      fsFreezeStatus: 'thawed',
      os: {
        prettyName: 'Fedora Linux',
        version: '40',
        kernelRelease: '6.8.0',
        machine: 'x86_64',
      },
    });

  return item;
}

const meta: Meta<typeof GuestInfoPanel> = {
  title: 'KubeVirt/Guest info panel',
  component: GuestInfoPanel,
};

export default meta;

type Story = StoryObj<typeof GuestInfoPanel>;

export const Connected: Story = {
  args: {
    item: guestInfoVmi(true),
  },
};

export const Disconnected: Story = {
  args: {
    item: guestInfoVmi(false),
  },
};
