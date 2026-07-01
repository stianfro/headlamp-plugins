import {
  Link,
  Loader,
  ResourceListView,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus } from '../../lib/status';
import { VirtualMachineInstanceMigration } from '../../resources/VirtualMachineInstanceMigration';

const MIGRATION_DETAILS_ROUTE = '/kubevirt/migrations/:namespace/:name';
const VMI_DETAILS_ROUTE = '/kubevirt/virtualmachineinstances/:namespace/:name';

type LabelStatus = 'success' | 'warning' | 'error' | '';

function migrationPhaseStatus(phase?: string | null): LabelStatus {
  switch (phase) {
    case 'Succeeded':
      return 'success';
    case 'Failed':
      return 'error';
    case 'Pending':
    case 'Scheduling':
    case 'Scheduled':
    case 'PreparingTarget':
    case 'TargetReady':
    case 'Running':
      return 'warning';
    default:
      return '';
  }
}

function PhaseLabel({ phase }: { phase?: string | null }) {
  return <StatusLabel status={migrationPhaseStatus(phase)}>{displayStatus(phase)}</StatusLabel>;
}

function vmiLink(item: VirtualMachineInstanceMigration) {
  const vmiName = item.spec.vmiName;
  const namespace = item.getNamespace();

  if (!vmiName || !namespace) {
    return vmiName || '-';
  }

  return (
    <Link routeName={VMI_DETAILS_ROUTE} params={{ namespace, name: vmiName }}>
      {vmiName}
    </Link>
  );
}

export function MigrationList() {
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="migration resources" />;
  }

  return (
    <ResourceListView
      title="Migrations"
      resourceClass={VirtualMachineInstanceMigration}
      id="kubevirt-migrations"
      reflectInURL="kubevirt-migrations"
      enableRowActions={false}
      enableRowSelection={false}
      headerProps={{ titleSideActions: [] }}
      columns={[
        {
          id: 'name',
          label: 'Name',
          getValue: item => item.getName(),
          render: item => (
            <Link
              routeName={MIGRATION_DETAILS_ROUTE}
              params={{ namespace: item.getNamespace(), name: item.getName() }}
            >
              {item.getName()}
            </Link>
          ),
        },
        'namespace',
        {
          id: 'vmi',
          label: 'VMI',
          getValue: item => item.spec.vmiName ?? '',
          render: item => vmiLink(item),
        },
        {
          id: 'phase',
          label: 'Phase',
          getValue: item => item.status.phase ?? 'Unknown',
          render: item => <PhaseLabel phase={item.status.phase} />,
        },
        'age',
      ]}
    />
  );
}
