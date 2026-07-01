import {
  ConditionsSection,
  DateLabel,
  DetailsGrid,
  Link,
  Loader,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus } from '../../lib/status';
import { VirtualMachineInstanceMigration } from '../../resources/VirtualMachineInstanceMigration';

const VMI_DETAILS_ROUTE = '/kubevirt/virtualmachineinstances/:namespace/:name';

type LabelStatus = 'success' | 'warning' | 'error' | '';

interface MigrationDetailsProps {
  name?: string;
  namespace?: string;
}

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

function phaseValue(phase?: string | null): ReactNode {
  return <StatusLabel status={migrationPhaseStatus(phase)}>{displayStatus(phase)}</StatusLabel>;
}

function vmiValue(item: VirtualMachineInstanceMigration): ReactNode {
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

function nodeValue(nodeName?: string): ReactNode {
  if (!nodeName) {
    return '-';
  }

  return (
    <Link routeName="node" params={{ name: nodeName }}>
      {nodeName}
    </Link>
  );
}

function timestampValue(timestamp?: string): ReactNode {
  return timestamp ? <DateLabel date={timestamp} /> : '-';
}

function migrationInfo(item: VirtualMachineInstanceMigration) {
  const migrationState = item.status.migrationState;

  return [
    {
      name: 'VMI',
      value: vmiValue(item),
    },
    {
      name: 'Phase',
      value: phaseValue(item.status.phase),
    },
    {
      name: 'Source node',
      value: nodeValue(migrationState?.sourceNode),
    },
    {
      name: 'Target node',
      value: nodeValue(migrationState?.targetNode),
    },
    {
      name: 'Started',
      value: timestampValue(migrationState?.startTimestamp),
    },
    {
      name: 'Ended',
      value: timestampValue(migrationState?.endTimestamp),
    },
  ];
}

function migrationSections(item: VirtualMachineInstanceMigration) {
  if (!item.status.conditions?.length) {
    return [];
  }

  return [
    {
      id: 'conditions',
      section: <ConditionsSection resource={item} />,
    },
  ];
}

export function MigrationDetails(props: MigrationDetailsProps) {
  const params = useParams<{ namespace: string; name: string }>();
  const namespace = props.namespace ?? params.namespace;
  const name = props.name ?? params.name;
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="migration resources" />;
  }

  return (
    <DetailsGrid
      resourceType={VirtualMachineInstanceMigration}
      name={name}
      namespace={namespace}
      withEvents
      noDefaultActions
      extraInfo={item => (item ? migrationInfo(item) : null)}
      extraSections={item => (item ? migrationSections(item) : [])}
    />
  );
}
