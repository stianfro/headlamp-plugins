import { Icon } from '@iconify/react';
import { registerKindIcon } from '@kinvolk/headlamp-plugin/lib';
import React from 'react';

const ICONS: Record<string, string> = {
  VirtualMachine: 'mdi:server',
  VirtualMachineInstance: 'mdi:server-network',
  VirtualMachineInstanceMigration: 'mdi:swap-horizontal',
  DataVolume: 'mdi:database-arrow-down',
};

export function registerIcons(): void {
  Object.entries(ICONS).forEach(([kind, icon]) => {
    registerKindIcon(kind, { icon: React.createElement(Icon, { icon, width: 32 }) });
  });
}
