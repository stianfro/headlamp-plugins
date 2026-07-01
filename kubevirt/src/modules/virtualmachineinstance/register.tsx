import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { VirtualMachineInstanceDetails } from './Details';
import { VirtualMachineInstanceList } from './List';
import { VMI_DETAIL_ROUTE, VMI_LIST_ROUTE } from './routes';

export function registerVirtualMachineInstance(): void {
  registerSidebarEntry({
    name: 'kv-vmis',
    parent: 'kubevirt',
    label: 'VM Instances',
    url: VMI_LIST_ROUTE,
  });

  registerRoute({
    path: VMI_LIST_ROUTE,
    sidebar: 'kv-vmis',
    name: 'VM Instances',
    exact: true,
    component: VirtualMachineInstanceList,
  });

  registerRoute({
    path: VMI_DETAIL_ROUTE,
    sidebar: 'kv-vmis',
    name: 'VM Instance',
    exact: true,
    component: VirtualMachineInstanceDetails,
  });
}
