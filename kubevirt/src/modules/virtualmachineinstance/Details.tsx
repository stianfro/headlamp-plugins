import { K8s } from '@kinvolk/headlamp-plugin/lib';
import {
  ActionButton,
  DateLabel,
  Link,
  Loader,
  Resource,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useParams } from 'react-router-dom';
import { NotInstalled } from '../../components/NotInstalled';
import { SerialConsole } from '../../components/SerialConsole';
import { useKubevirtInstalled } from '../../lib/crdGate';
import { displayStatus, vmiPhaseColor } from '../../lib/status';
import { VirtualMachineInstance } from '../../resources/VirtualMachineInstance';
import type { KubeVirtDiskStatus, KubeVirtInterfaceStatus } from '../../typedefs';
import { GuestInfoPanel } from './GuestInfoPanel';

const Pod = K8s.ResourceClasses.Pod;

interface RouteParams {
  namespace: string;
  name: string;
}

function conditionIsTrue(item: VirtualMachineInstance, type: string): boolean {
  return (
    item.status.conditions?.some(condition => condition.type === type && condition.status === 'True') ?? false
  );
}

function isFrozen(item: VirtualMachineInstance): boolean {
  return item.status.fsFreezeStatus === 'frozen';
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => !!value)));
}

function interfaceIps(item: VirtualMachineInstance): string[] {
  return uniqueValues(
    item.status.interfaces?.flatMap(iface => {
      const addresses = iface.ipAddresses ?? [];

      return iface.ipAddress ? [iface.ipAddress, ...addresses] : addresses;
    }) ?? []
  );
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function toastName(item: VirtualMachineInstance): string {
  const namespace = item.getNamespace();

  return namespace ? `${namespace}/${item.getName()}` : item.getName();
}

function nodeLink(nodeName: string | undefined, cluster: string | undefined) {
  return nodeName ? (
    <Link routeName="node" params={{ name: nodeName }} activeCluster={cluster}>
      {nodeName}
    </Link>
  ) : (
    'Unknown'
  );
}

function launcherPodFor(pods: Array<InstanceType<typeof Pod>> | null) {
  if (!pods?.length) {
    return null;
  }

  return pods.find(pod => pod.status.phase === 'Running') ?? pods[0];
}

function LauncherPodLink({ pod }: { pod: InstanceType<typeof Pod> | null }) {
  if (!pod) {
    return <>Not found</>;
  }

  return (
    <Link
      routeName="pod"
      params={{ namespace: pod.getNamespace() ?? '', name: pod.getName() }}
      activeCluster={pod.cluster}
    >
      {pod.getName()}
    </Link>
  );
}

function MigrationSummary({ item }: { item: VirtualMachineInstance }) {
  const migration = item.status.migrationState;

  if (!migration) {
    return <>None</>;
  }

  const state = migration.failed ? 'Failed' : migration.completed ? 'Completed' : 'In progress';
  const endpoints = [migration.sourceNode, migration.targetNode].filter(Boolean).join(' to ');

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2">{state}</Typography>
      {endpoints && <Typography variant="body2">{endpoints}</Typography>}
      {migration.startTimestamp && (
        <Typography variant="body2">
          Started <DateLabel date={migration.startTimestamp} />
        </Typography>
      )}
      {migration.endTimestamp && (
        <Typography variant="body2">
          Ended <DateLabel date={migration.endTimestamp} />
        </Typography>
      )}
    </Stack>
  );
}

function StatusDisksSection({ disks }: { disks?: KubeVirtDiskStatus[] }) {
  return (
    <SectionBox title="Disks">
      <SimpleTable
        data={disks ?? []}
        emptyMessage="No disk status reported."
        columns={[
          { label: 'Name', datum: 'name' },
          { label: 'Target', datum: 'target' },
          { label: 'Bus', datum: 'bus' },
          { label: 'Serial', datum: 'serial' },
        ]}
      />
    </SectionBox>
  );
}

function StatusInterfacesSection({ interfaces }: { interfaces?: KubeVirtInterfaceStatus[] }) {
  return (
    <SectionBox title="Interfaces">
      <SimpleTable
        data={interfaces ?? []}
        emptyMessage="No interface status reported."
        columns={[
          { label: 'Name', datum: 'name' },
          {
            label: 'IP addresses',
            getter: (iface: KubeVirtInterfaceStatus) =>
              uniqueValues(iface.ipAddress ? [iface.ipAddress, ...(iface.ipAddresses ?? [])] : iface.ipAddresses ?? []).join(
                ', '
              ),
          },
          { label: 'MAC', datum: 'mac' },
          { label: 'Info source', datum: 'infoSource' },
        ]}
      />
    </SectionBox>
  );
}

interface ActionProps {
  item: VirtualMachineInstance;
  onOpenConsole: () => void;
}

function VirtualMachineInstanceActions({ item, onOpenConsole }: ActionProps) {
  const { enqueueSnackbar } = useSnackbar();

  const runAction = React.useCallback(
    (label: string, action: () => Promise<unknown>) => {
      void action()
        .then(() => {
          enqueueSnackbar(`${label} requested for ${toastName(item)}.`, { variant: 'success' });
        })
        .catch(err => {
          enqueueSnackbar(`${label} failed for ${toastName(item)}: ${errorText(err)}`, { variant: 'error' });
        });
    },
    [enqueueSnackbar, item]
  );

  const paused = conditionIsTrue(item, 'Paused');
  const frozen = isFrozen(item);

  return (
    <>
      <Resource.AuthVisible item={item} authVerb="update" subresource={paused ? 'unpause' : 'pause'}>
        <ActionButton
          description={paused ? 'Unpause' : 'Pause'}
          icon={paused ? 'mdi:play-circle' : 'mdi:pause-circle'}
          onClick={() => runAction(paused ? 'Unpause' : 'Pause', () => (paused ? item.unpause() : item.pause()))}
        />
      </Resource.AuthVisible>
      <Resource.AuthVisible item={item} authVerb="update" subresource={frozen ? 'unfreeze' : 'freeze'}>
        <ActionButton
          description={frozen ? 'Unfreeze filesystem' : 'Freeze filesystem'}
          icon={frozen ? 'mdi:snowflake-off' : 'mdi:snowflake'}
          onClick={() => runAction(frozen ? 'Unfreeze filesystem' : 'Freeze filesystem', () => (frozen ? item.unfreeze() : item.freeze()))}
        />
      </Resource.AuthVisible>
      <Resource.AuthVisible item={item} authVerb="update" subresource="softreboot">
        <ActionButton
          description="Reboot guest"
          icon="mdi:restart"
          onClick={() => runAction('Reboot guest', () => item.softReboot())}
        />
      </Resource.AuthVisible>
      <Resource.AuthVisible item={item} authVerb="get" subresource="console">
        <ActionButton description="Open serial console" icon="mdi:console" onClick={onOpenConsole} />
      </Resource.AuthVisible>
    </>
  );
}

function VirtualMachineInstanceDetailsContent({ name, namespace }: RouteParams) {
  const [consoleOpen, setConsoleOpen] = React.useState(false);
  const [pods, podError] = Pod.useList({ namespace, labelSelector: `vm.kubevirt.io/name=${name}` });
  const launcherPod = launcherPodFor(pods);

  return (
    <>
      {podError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Launcher pod lookup failed: {Pod.getErrorMessage(podError) ?? errorText(podError)}
        </Alert>
      )}
      <Resource.DetailsGrid
        resourceType={VirtualMachineInstance}
        name={name}
        namespace={namespace}
        withEvents
        extraInfo={item => {
          if (!item) {
            return null;
          }

          const phase = item.status.phase ?? 'Unknown';
          const ips = interfaceIps(item);

          return [
            {
              name: 'Phase',
              value: <Chip size="small" label={displayStatus(phase)} color={vmiPhaseColor(phase)} />,
            },
            { name: 'Node', value: nodeLink(item.status.nodeName, item.cluster) },
            { name: 'IP addresses', value: ips.length ? ips.join(', ') : 'None' },
            { name: 'Migration', value: <MigrationSummary item={item} /> },
            { name: 'Launcher pod', value: <LauncherPodLink pod={launcherPod} /> },
          ];
        }}
        extraSections={item =>
          item
            ? [
                {
                  id: 'kubevirt.vmi.conditions',
                  section: <Resource.ConditionsSection resource={item} />,
                },
                {
                  id: 'kubevirt.vmi.guest-info',
                  section: (
                    <Resource.AuthVisible item={item} authVerb="get" subresource="guestosinfo">
                      <GuestInfoPanel item={item} />
                    </Resource.AuthVisible>
                  ),
                },
                {
                  id: 'kubevirt.vmi.disks',
                  section: <StatusDisksSection disks={item.status.disks} />,
                },
                {
                  id: 'kubevirt.vmi.interfaces',
                  section: <StatusInterfacesSection interfaces={item.status.interfaces} />,
                },
                {
                  id: 'kubevirt.vmi.serial-console',
                  section: (
                    <SerialConsole vmi={item} open={consoleOpen} onClose={() => setConsoleOpen(false)} />
                  ),
                },
              ]
            : []
        }
        actions={item =>
          item
            ? [
                {
                  id: 'kubevirt.vmi.actions',
                  action: <VirtualMachineInstanceActions item={item} onOpenConsole={() => setConsoleOpen(true)} />,
                },
              ]
            : null
        }
      />
    </>
  );
}

export function VirtualMachineInstanceDetails() {
  const { namespace, name } = useParams<RouteParams>();
  const installed = useKubevirtInstalled();

  if (installed === 'loading') {
    return <Loader title="Checking KubeVirt installation" />;
  }

  if (installed === 'absent') {
    return <NotInstalled resourceLabel="VM instances" />;
  }

  return <VirtualMachineInstanceDetailsContent namespace={namespace} name={name} />;
}

export default VirtualMachineInstanceDetails;
