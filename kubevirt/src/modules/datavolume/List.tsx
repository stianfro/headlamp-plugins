import { Link, Loader, Resource } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useNamespaces } from '@kinvolk/headlamp-plugin/lib/redux/filterSlice';
import Chip, { type ChipProps } from '@mui/material/Chip';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { DataVolume } from '../../resources/DataVolume';

const DATA_VOLUME_DETAIL_ROUTE = 'kv-datavolume';

type DataVolumeChipColor = Extract<ChipProps['color'], 'success' | 'warning' | 'error' | 'default'>;

function dataVolumePhaseColor(phase?: string | null): DataVolumeChipColor {
  switch (phase) {
    case 'Succeeded':
    case 'PVCBound':
      return 'success';
    case 'Pending':
    case 'ImportScheduled':
    case 'ImportInProgress':
    case 'WaitForFirstConsumer':
      return 'warning';
    case 'Failed':
      return 'error';
    default:
      return 'default';
  }
}

export function DataVolumePhaseChip({ phase }: { phase?: string | null }) {
  const label = phase || 'Unknown';

  return <Chip label={label} color={dataVolumePhaseColor(phase)} size="small" />;
}

export function getRequestedSize(item: DataVolume): string {
  return (
    item.spec.storage?.resources?.requests?.storage ?? item.spec.pvc?.resources?.requests?.storage ?? ''
  );
}

function DataVolumeNameLink({ item }: { item: DataVolume }) {
  const name = item.getName();
  const namespace = item.getNamespace();

  if (!namespace) {
    return <>{name}</>;
  }

  return (
    <Link
      routeName={DATA_VOLUME_DETAIL_ROUTE}
      params={{ namespace, name }}
      activeCluster={item.cluster}
      tooltip
    >
      {name}
    </Link>
  );
}

function DataVolumeTable() {
  const namespaces = useNamespaces();
  const { items, errors } = DataVolume.useList({ namespace: namespaces });

  return (
    <Resource.ResourceListView
      title="DataVolumes"
      columns={[
        {
          id: 'name',
          label: 'Name',
          getValue: item => item.getName(),
          render: item => <DataVolumeNameLink item={item} />,
        },
        'namespace',
        {
          id: 'phase',
          label: 'Phase',
          filterVariant: 'multi-select',
          getValue: item => item.status.phase ?? 'Unknown',
          render: item => <DataVolumePhaseChip phase={item.status.phase} />,
        },
        {
          id: 'progress',
          label: 'Progress',
          getValue: item => item.status.progress ?? '',
        },
        {
          id: 'size',
          label: 'Size',
          getValue: item => getRequestedSize(item),
        },
        'age',
      ]}
      data={items}
      errors={errors}
      headerProps={{ noNamespaceFilter: false }}
      id="kubevirt-datavolumes"
      reflectInURL
    />
  );
}

export function DataVolumeList() {
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="DataVolumes" />;
  }

  return <DataVolumeTable />;
}

export default DataVolumeList;
