import { registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { registerIcons } from './icons';
import { registerDataVolume } from './modules/datavolume/register';
import { registerMigration } from './modules/migration/register';
import { registerVirtualMachine } from './modules/virtualmachine/register';
import { registerVirtualMachineInstance } from './modules/virtualmachineinstance/register';

registerSidebarEntry({
  parent: null,
  name: 'kubevirt',
  label: 'Virtualization',
  icon: 'mdi:server',
  url: '/kubevirt/virtualmachines',
});

registerVirtualMachine();
registerVirtualMachineInstance();
registerMigration();
registerDataVolume();
registerIcons();
