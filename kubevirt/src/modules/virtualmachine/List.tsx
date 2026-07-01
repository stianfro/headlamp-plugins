import { Link, Loader, ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import { Chip } from '@mui/material';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus, vmStatusColor } from '../../lib/status';
import { VirtualMachine } from '../../resources/VirtualMachine';

const DETAILS_ROUTE_NAME = 'kubevirtVirtualMachine';

function readyLabel(value?: boolean): string {
  if (value === true) {
    return 'Yes';
  }

  if (value === false) {
    return 'No';
  }

  return 'Unknown';
}

function VirtualMachineTable() {
  return (
    <ResourceListView
      title="Virtual Machines"
      resourceClass={VirtualMachine}
      id="kubevirt-virtualmachines"
      reflectInURL
      columns={[
        {
          id: 'name',
          label: 'Name',
          getValue: item => item.getName(),
          render: item => (
            <Link
              routeName={DETAILS_ROUTE_NAME}
              params={{ namespace: item.getNamespace(), name: item.getName() }}
              activeCluster={item.cluster}
            >
              {item.getName()}
            </Link>
          ),
        },
        'namespace',
        'cluster',
        {
          id: 'status',
          label: 'Status',
          getValue: item => displayStatus(item.status.printableStatus),
          render: item => {
            const status = item.status.printableStatus;

            return <Chip label={displayStatus(status)} size="small" color={vmStatusColor(status)} />;
          },
        },
        {
          id: 'ready',
          label: 'Ready',
          getValue: item => readyLabel(item.status.ready),
        },
        'age',
      ]}
    />
  );
}

export function VirtualMachineList() {
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Loading KubeVirt status" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="Virtual Machines" />;
  }

  return <VirtualMachineTable />;
}
