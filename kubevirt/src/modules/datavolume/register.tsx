import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { DataVolumeDetails } from './Details';
import { DataVolumeList } from './List';

export function registerDataVolume(): void {
  registerSidebarEntry({
    parent: 'kubevirt',
    name: 'kv-datavolumes',
    label: 'DataVolumes',
    icon: 'mdi:database-arrow-down',
    url: '/kubevirt/datavolumes',
  });

  registerRoute({
    path: '/kubevirt/datavolumes',
    sidebar: 'kv-datavolumes',
    exact: true,
    name: 'kv-datavolumes',
    component: DataVolumeList,
  });

  registerRoute({
    path: '/kubevirt/datavolumes/:namespace/:name',
    sidebar: 'kv-datavolumes',
    exact: true,
    name: 'kv-datavolume',
    component: DataVolumeDetails,
  });
}
