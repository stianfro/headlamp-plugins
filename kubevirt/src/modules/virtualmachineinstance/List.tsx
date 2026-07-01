import { Link, Loader, Resource } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Chip } from '@mui/material';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus, vmiPhaseColor } from '../../lib/status';
import { VirtualMachineInstance } from '../../resources/VirtualMachineInstance';
import { VMI_DETAIL_ROUTE } from './routes';

function interfaceIps(item: VirtualMachineInstance): string[] {
  return (
    item.status.interfaces?.flatMap(iface => {
      const addresses = iface.ipAddresses ?? [];

      return iface.ipAddress ? [iface.ipAddress, ...addresses] : addresses;
    }) ?? []
  );
}

function primaryIp(item: VirtualMachineInstance): string {
  return interfaceIps(item)[0] ?? '';
}

function VirtualMachineInstanceTable() {
  const [items, error] = VirtualMachineInstance.useList();

  return (
    <Resource.ResourceListView
      title="VM Instances"
      id="kubevirt-virtualmachineinstances"
      data={items}
      errorMessage={VirtualMachineInstance.getErrorMessage(error)}
      reflectInURL
      columns={[
        {
          id: 'name',
          label: 'Name',
          getValue: (item: VirtualMachineInstance) => item.getName(),
          render: (item: VirtualMachineInstance) => (
            <Link
              routeName={VMI_DETAIL_ROUTE}
              params={{ namespace: item.getNamespace() ?? '', name: item.getName() }}
              activeCluster={item.cluster}
            >
              {item.getName()}
            </Link>
          ),
        },
        'namespace',
        'cluster',
        {
          id: 'phase',
          label: 'Phase',
          getValue: (item: VirtualMachineInstance) => item.status.phase ?? 'Unknown',
          render: (item: VirtualMachineInstance) => {
            const phase = item.status.phase ?? 'Unknown';

            return <Chip size="small" label={displayStatus(phase)} color={vmiPhaseColor(phase)} />;
          },
        },
        {
          id: 'node',
          label: 'Node',
          getValue: (item: VirtualMachineInstance) => item.status.nodeName ?? '',
          render: (item: VirtualMachineInstance) => {
            const nodeName = item.status.nodeName;

            return nodeName ? (
              <Link routeName="node" params={{ name: nodeName }} activeCluster={item.cluster}>
                {nodeName}
              </Link>
            ) : (
              ''
            );
          },
        },
        {
          id: 'primaryIP',
          label: 'Primary IP',
          getValue: primaryIp,
        },
        'age',
      ]}
    />
  );
}

export function VirtualMachineInstanceList() {
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="VM instances" />;
  }

  return <VirtualMachineInstanceTable />;
}

export default VirtualMachineInstanceList;
