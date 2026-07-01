import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { VirtualMachineDetails } from './Details';
import { VirtualMachineList } from './List';

const SIDEBAR_NAME = 'kv-virtualmachines';
const LIST_ROUTE = '/kubevirt/virtualmachines';
const DETAILS_ROUTE = '/kubevirt/virtualmachines/:namespace/:name';

export function registerVirtualMachine(): void {
  registerSidebarEntry({
    parent: 'kubevirt',
    name: SIDEBAR_NAME,
    label: 'Virtual Machines',
    url: LIST_ROUTE,
  });

  registerRoute({
    path: LIST_ROUTE,
    sidebar: SIDEBAR_NAME,
    exact: true,
    name: 'kubevirtVirtualMachines',
    component: VirtualMachineList,
  });

  registerRoute({
    path: DETAILS_ROUTE,
    sidebar: SIDEBAR_NAME,
    name: 'kubevirtVirtualMachine',
    component: () => <VirtualMachineDetails />,
  });
}
