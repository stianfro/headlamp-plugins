import { Link, Loader, Resource } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { useParams } from 'react-router-dom';
import { NotInstalled } from '../../components/NotInstalled';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { DataVolume } from '../../resources/DataVolume';
import { DataVolumePhaseChip, getRequestedSize } from './List';

interface DataVolumeDetailsProps {
  name?: string;
  namespace?: string;
  cluster?: string;
}

interface RouteParams {
  name?: string;
  namespace?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  blank: 'Blank',
  gcs: 'GCS',
  http: 'HTTP',
  imageio: 'ImageIO',
  pvc: 'PVC',
  registry: 'Registry',
  s3: 'S3',
  snapshot: 'Snapshot',
  vddk: 'VDDK',
};

function getSourceType(item: DataVolume): string {
  const source = item.spec.source;

  if (!source) {
    return 'Unknown';
  }

  const sourceKey = Object.entries(source).find(([, value]) => value !== undefined && value !== null)?.[0];

  if (!sourceKey) {
    return 'Unknown';
  }

  return SOURCE_LABELS[sourceKey] ?? sourceKey;
}

function getBoundPvcName(item: DataVolume): string {
  const claimName = item.status.claimName;

  if (typeof claimName === 'string' && claimName.length > 0) {
    return claimName;
  }

  return item.getName();
}

function PvcLink({ item }: { item: DataVolume }) {
  const namespace = item.getNamespace();
  const name = getBoundPvcName(item);

  if (!namespace) {
    return <>{name}</>;
  }

  return (
    <Link
      routeName="persistentVolumeClaim"
      params={{ namespace, name }}
      activeCluster={item.cluster}
      tooltip
    >
      {name}
    </Link>
  );
}

function DataVolumeDetailsGrid({
  name,
  namespace,
  cluster,
}: DataVolumeDetailsProps & { name: string; namespace: string }) {
  return (
    <Resource.DetailsGrid
      resourceType={DataVolume}
      name={name}
      namespace={namespace}
      cluster={cluster}
      withEvents
      extraInfo={item =>
        item && [
          {
            name: 'Phase',
            value: <DataVolumePhaseChip phase={item.status.phase} />,
          },
          {
            name: 'Progress',
            value: item.status.progress || 'None',
          },
          {
            name: 'Source type',
            value: getSourceType(item),
          },
          {
            name: 'Requested size',
            value: getRequestedSize(item) || 'Unknown',
          },
          {
            name: 'Bound PVC',
            value: <PvcLink item={item} />,
          },
        ]
      }
      extraSections={item =>
        item && [<Resource.ConditionsSection key="conditions" resource={item} />]
      }
    />
  );
}

export function DataVolumeDetails(props: DataVolumeDetailsProps = {}) {
  const params = useParams<RouteParams>();
  const installed = useKubevirtInstalled();
  const name = props.name ?? params.name;
  const namespace = props.namespace ?? params.namespace;

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="DataVolumes" />;
  }

  if (!name || !namespace) {
    return <Loader title="Loading DataVolume details" />;
  }

  return <DataVolumeDetailsGrid name={name} namespace={namespace} cluster={props.cluster} />;
}

export default DataVolumeDetails;
