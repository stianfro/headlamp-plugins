import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  Link,
  Loader,
  Resource,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Chip, Stack, Typography } from '@mui/material';
import React from 'react';
import { useParams } from 'react-router-dom';
import { NotInstalled } from '../../components/NotInstalled';
import { SerialConsole } from '../../components/SerialConsole';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus, vmStatusColor } from '../../lib/status';
import { VirtualMachine } from '../../resources/VirtualMachine';
import { VirtualMachineInstance } from '../../resources/VirtualMachineInstance';
import type {
  KubeVirtDisk,
  KubeVirtInterface,
  KubeVirtNetwork,
  KubeVirtVirtualMachineInstance,
  KubeVirtVolume,
  ObjectReference,
} from '../../typedefs';
import { useVirtualMachineActions } from './actions';

const VMI_DETAILS_ROUTE = '/kubevirt/virtualmachineinstances/:namespace/:name';

type LauncherPod = InstanceType<typeof K8s.ResourceClasses.Pod>;

interface VirtualMachineDetailsProps {
  namespace?: string;
  name?: string;
}

interface DiskVolumeRow {
  name: string;
  bus: string;
  source: string;
}

interface NetworkInterfaceRow {
  name: string;
  model: string;
  binding: string;
  mac: string;
  network: string;
}

function notAvailable(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
}

function referenceLabel(reference?: ObjectReference): string | undefined {
  if (!reference?.name) {
    return undefined;
  }

  return [reference.kind, reference.name].filter(Boolean).join('/');
}

function cpuTopology(item: VirtualMachine): string | undefined {
  const cpu = item.spec.template?.spec?.domain?.cpu;

  if (!cpu) {
    return undefined;
  }

  const parts = [
    cpu.sockets !== undefined ? `${cpu.sockets} sockets` : undefined,
    cpu.cores !== undefined ? `${cpu.cores} cores` : undefined,
    cpu.threads !== undefined ? `${cpu.threads} threads` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : undefined;
}

function guestMemory(item: VirtualMachine): string | undefined {
  return item.spec.template?.spec?.domain?.memory?.guest;
}

function findLauncherPod(pods: LauncherPod[] | null): LauncherPod | null {
  if (!pods || pods.length === 0) {
    return null;
  }

  return (
    pods.find(pod => pod.status?.phase === 'Running') ??
    pods.find(pod => pod.status?.phase !== 'Succeeded' && pod.status?.phase !== 'Failed') ??
    pods[0]
  );
}

function statusChip(item: VirtualMachine) {
  const status = item.status.printableStatus;

  return <Chip label={displayStatus(status)} size="small" color={vmStatusColor(status)} />;
}

function nodeLink(pod: LauncherPod | null): React.ReactNode {
  const nodeName = pod?.spec?.nodeName;

  if (!nodeName) {
    return '-';
  }

  return (
    <Link routeName="node" params={{ name: nodeName }} activeCluster={pod.cluster}>
      {nodeName}
    </Link>
  );
}

function podLink(pod: LauncherPod | null): React.ReactNode {
  if (!pod) {
    return '-';
  }

  return (
    <Link
      routeName="pod"
      params={{ namespace: pod.getNamespace(), name: pod.getName() }}
      activeCluster={pod.cluster}
    >
      {pod.getName()}
    </Link>
  );
}

function vmiLink(item: VirtualMachine): React.ReactNode {
  return (
    <Link
      routeName={VMI_DETAILS_ROUTE}
      params={{ namespace: item.getNamespace(), name: item.getName() }}
      activeCluster={item.cluster}
    >
      {item.getName()}
    </Link>
  );
}

function namedValue(name: string, value?: string): string {
  return value ? `${name}: ${value}` : name;
}

function sourceFromVolume(volume?: KubeVirtVolume): string {
  if (!volume) {
    return '-';
  }

  if (volume.dataVolume) {
    return namedValue('DataVolume', volume.dataVolume.name);
  }

  if (volume.persistentVolumeClaim) {
    const pvc = volume.persistentVolumeClaim as { claimName?: string; name?: string };

    return namedValue('PVC', pvc.claimName ?? pvc.name);
  }

  if (volume.containerDisk) {
    return namedValue('containerDisk', volume.containerDisk.image);
  }

  if (volume.cloudInitNoCloud) {
    return 'cloudInitNoCloud';
  }

  if (volume.cloudInitConfigDrive) {
    return 'cloudInitConfigDrive';
  }

  if (volume.emptyDisk) {
    return 'emptyDisk';
  }

  if (volume.configMap) {
    return namedValue('ConfigMap', volume.configMap.name);
  }

  if (volume.secret) {
    return namedValue('Secret', volume.secret.name);
  }

  if (volume.serviceAccount) {
    return namedValue('ServiceAccount', volume.serviceAccount.name);
  }

  if (volume.downwardAPI) {
    return 'downwardAPI';
  }

  if (volume.hostDisk) {
    return 'hostDisk';
  }

  return Object.keys(volume).find(key => key !== 'name') ?? '-';
}

function diskBus(disk: KubeVirtDisk): string {
  return notAvailable(disk.disk?.bus ?? disk.lun?.bus ?? disk.cdrom?.bus);
}

function diskRows(item: VirtualMachine): DiskVolumeRow[] {
  const templateSpec = item.spec.template?.spec;
  const volumesByName = new Map((templateSpec?.volumes ?? []).map(volume => [volume.name, volume]));

  return (templateSpec?.domain?.devices?.disks ?? []).map(disk => ({
    name: disk.name,
    bus: diskBus(disk),
    source: sourceFromVolume(volumesByName.get(disk.name)),
  }));
}

function networkSource(network?: KubeVirtNetwork): string {
  if (!network) {
    return '-';
  }

  if (network.pod) {
    return 'pod';
  }

  if (network.multus) {
    return namedValue('multus', network.multus.networkName);
  }

  return Object.keys(network).find(key => key !== 'name') ?? '-';
}

function bindingType(networkInterface: KubeVirtInterface): string {
  if (networkInterface.binding?.name) {
    return networkInterface.binding.name;
  }

  for (const key of ['bridge', 'masquerade', 'slirp', 'sriov'] as const) {
    if (networkInterface[key]) {
      return key;
    }
  }

  return '-';
}

function interfaceRows(item: VirtualMachine): NetworkInterfaceRow[] {
  const templateSpec = item.spec.template?.spec;
  const networksByName = new Map((templateSpec?.networks ?? []).map(network => [network.name, network]));

  return (templateSpec?.domain?.devices?.interfaces ?? []).map(networkInterface => ({
    name: networkInterface.name,
    model: notAvailable(networkInterface.model),
    binding: bindingType(networkInterface),
    mac: notAvailable(networkInterface.macAddress),
    network: networkSource(networksByName.get(networkInterface.name)),
  }));
}

function vmToVmi(item: VirtualMachine): VirtualMachineInstance {
  return new VirtualMachineInstance(
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: {
        name: item.getName(),
        namespace: item.getNamespace(),
      },
      spec: item.spec.template?.spec ?? {},
    } as KubeVirtVirtualMachineInstance,
    item.cluster
  );
}

function DisksAndVolumesSection({ item }: { item: VirtualMachine }) {
  return (
    <SectionBox title="Disks and Volumes">
      <SimpleTable
        data={diskRows(item)}
        emptyMessage="No disks found"
        columns={[
          { label: 'Name', getter: row => row.name },
          { label: 'Bus', getter: row => row.bus },
          { label: 'Source', getter: row => row.source },
        ]}
      />
    </SectionBox>
  );
}

function NetworkInterfacesSection({ item }: { item: VirtualMachine }) {
  return (
    <SectionBox title="Network Interfaces">
      <SimpleTable
        data={interfaceRows(item)}
        emptyMessage="No network interfaces found"
        columns={[
          { label: 'Name', getter: row => row.name },
          { label: 'Model', getter: row => row.model },
          { label: 'Binding', getter: row => row.binding },
          { label: 'MAC', getter: row => row.mac },
          { label: 'Network', getter: row => row.network },
        ]}
      />
    </SectionBox>
  );
}

function VirtualMachineDetailsContent({ namespace, name }: Required<VirtualMachineDetailsProps>) {
  const [showConsole, setShowConsole] = React.useState(false);
  const actions = useVirtualMachineActions(React.useCallback(() => setShowConsole(true), []));
  const [pods] = K8s.ResourceClasses.Pod.useList({
    namespace,
    labelSelector: `vm.kubevirt.io/name=${name}`,
  });
  const launcherPod = findLauncherPod(pods);

  return (
    <DetailsGridWithSections
      name={name}
      namespace={namespace}
      launcherPod={launcherPod}
      showConsole={showConsole}
      onCloseConsole={() => setShowConsole(false)}
      actions={actions}
    />
  );
}

function DetailsGridWithSections({
  name,
  namespace,
  launcherPod,
  showConsole,
  onCloseConsole,
  actions,
}: {
  name: string;
  namespace: string;
  launcherPod: LauncherPod | null;
  showConsole: boolean;
  onCloseConsole: () => void;
  actions: ReturnType<typeof useVirtualMachineActions>;
}) {
  return (
    <Resource.DetailsGrid
      resourceType={VirtualMachine}
      name={name}
      namespace={namespace}
      withEvents
      actions={actions}
      extraInfo={item => {
        if (!item) {
          return null;
        }

        return [
          { name: 'Status', value: statusChip(item) },
          { name: 'Run Strategy', value: notAvailable(item.spec.runStrategy) },
          { name: 'Instancetype', value: referenceLabel(item.spec.instancetype), hide: !item.spec.instancetype },
          { name: 'Preference', value: referenceLabel(item.spec.preference), hide: !item.spec.preference },
          { name: 'CPU Topology', value: cpuTopology(item), hide: !cpuTopology(item) },
          { name: 'Guest Memory', value: guestMemory(item), hide: !guestMemory(item) },
          { name: 'VirtualMachineInstance', value: vmiLink(item) },
          { name: 'Launcher Pod', value: podLink(launcherPod) },
          { name: 'Node', value: nodeLink(launcherPod), hide: !launcherPod?.spec?.nodeName },
        ];
      }}
      extraSections={item => {
        if (!item) {
          return [];
        }

        return [
          {
            id: 'conditions',
            section: <Resource.ConditionsSection resource={item} />,
          },
          {
            id: 'disks-and-volumes',
            section: <DisksAndVolumesSection item={item} />,
          },
          {
            id: 'network-interfaces',
            section: <NetworkInterfacesSection item={item} />,
          },
          {
            id: 'serial-console',
            section: <SerialConsole vmi={vmToVmi(item)} open={showConsole} onClose={onCloseConsole} />,
          },
        ];
      }}
    />
  );
}

export function VirtualMachineDetails(props: VirtualMachineDetailsProps = {}) {
  const params = useParams<{ namespace: string; name: string }>();
  const namespace = props.namespace ?? params.namespace ?? '';
  const name = props.name ?? params.name ?? '';
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Loading KubeVirt status" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="Virtual Machines" />;
  }

  if (!namespace || !name) {
    return (
      <Stack spacing={1} sx={{ p: 3 }}>
        <Typography variant="h6">Virtual Machine not found</Typography>
        <Typography variant="body2" color="text.secondary">
          The route is missing a namespace or name.
        </Typography>
      </Stack>
    );
  }

  return <VirtualMachineDetailsContent namespace={namespace} name={name} />;
}
