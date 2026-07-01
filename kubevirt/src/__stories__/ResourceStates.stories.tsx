import { Loader, NameValueTable, SectionBox, SimpleTable } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Alert, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';

type ResourceMode = 'list' | 'details';
type ResourceState = 'loading' | 'error' | 'empty' | 'populated';

interface ResourceStateProps {
  resource: string;
  mode: ResourceMode;
  state: ResourceState;
}

const rowsByResource: Record<string, Array<Record<string, string>>> = {
  'Virtual Machines': [
    { name: 'fedora-vm', namespace: 'default', status: 'Running', detail: '2 cores, 4Gi memory' },
    { name: 'worker-vm', namespace: 'ops', status: 'Stopped', detail: '1 core, 2Gi memory' },
  ],
  'VM Instances': [
    { name: 'fedora-vm', namespace: 'default', status: 'Running', detail: 'node-a, 10.244.0.20' },
    { name: 'build-vm', namespace: 'ci', status: 'Scheduling', detail: 'waiting for node' },
  ],
  Migrations: [
    { name: 'migration-1', namespace: 'default', status: 'Running', detail: 'node-a to node-b' },
    { name: 'migration-2', namespace: 'ops', status: 'Succeeded', detail: 'node-c to node-d' },
  ],
  DataVolumes: [
    { name: 'fedora-rootdisk', namespace: 'default', status: 'ImportInProgress', detail: '73.4%' },
    { name: 'blank-disk', namespace: 'ops', status: 'Succeeded', detail: '10Gi' },
  ],
};

function rowsFor(resource: string, state: ResourceState) {
  if (state === 'empty') {
    return [];
  }

  return rowsByResource[resource] ?? [];
}

function ResourceStateView({ resource, mode, state }: ResourceStateProps) {
  if (state === 'loading') {
    return <Loader title={`Loading ${resource}`} />;
  }

  if (state === 'error') {
    return <Alert severity="error">{resource} could not be loaded.</Alert>;
  }

  if (mode === 'list') {
    return (
      <SectionBox title={`${resource} list`}>
        <SimpleTable
          data={rowsFor(resource, state)}
          emptyMessage={`No ${resource} found.`}
          columns={[
            { label: 'Name', datum: 'name' },
            { label: 'Namespace', datum: 'namespace' },
            { label: 'Status', datum: 'status' },
            { label: 'Details', datum: 'detail' },
          ]}
        />
      </SectionBox>
    );
  }

  if (state === 'empty') {
    return (
      <SectionBox title={`${resource} details`}>
        <Typography color="text.secondary">No object is selected.</Typography>
      </SectionBox>
    );
  }

  const first = rowsFor(resource, state)[0];

  return (
    <SectionBox title={`${resource} details`}>
      <NameValueTable
        rows={[
          { name: 'Name', value: first.name },
          { name: 'Namespace', value: first.namespace },
          { name: 'Status', value: first.status },
          { name: 'Details', value: first.detail },
        ]}
      />
    </SectionBox>
  );
}

const meta: Meta<typeof ResourceStateView> = {
  title: 'KubeVirt/Resource states',
  component: ResourceStateView,
};

export default meta;

type Story = StoryObj<typeof ResourceStateView>;

const list = (resource: string, state: ResourceState): Story => ({ args: { resource, mode: 'list', state } });
const details = (resource: string, state: ResourceState): Story => ({ args: { resource, mode: 'details', state } });

export const VirtualMachineListLoading = list('Virtual Machines', 'loading');
export const VirtualMachineListError = list('Virtual Machines', 'error');
export const VirtualMachineListEmpty = list('Virtual Machines', 'empty');
export const VirtualMachineListPopulated = list('Virtual Machines', 'populated');
export const VirtualMachineDetailsLoading = details('Virtual Machines', 'loading');
export const VirtualMachineDetailsError = details('Virtual Machines', 'error');
export const VirtualMachineDetailsEmpty = details('Virtual Machines', 'empty');
export const VirtualMachineDetailsPopulated = details('Virtual Machines', 'populated');

export const VirtualMachineInstanceListLoading = list('VM Instances', 'loading');
export const VirtualMachineInstanceListError = list('VM Instances', 'error');
export const VirtualMachineInstanceListEmpty = list('VM Instances', 'empty');
export const VirtualMachineInstanceListPopulated = list('VM Instances', 'populated');
export const VirtualMachineInstanceDetailsLoading = details('VM Instances', 'loading');
export const VirtualMachineInstanceDetailsError = details('VM Instances', 'error');
export const VirtualMachineInstanceDetailsEmpty = details('VM Instances', 'empty');
export const VirtualMachineInstanceDetailsPopulated = details('VM Instances', 'populated');

export const MigrationListLoading = list('Migrations', 'loading');
export const MigrationListError = list('Migrations', 'error');
export const MigrationListEmpty = list('Migrations', 'empty');
export const MigrationListPopulated = list('Migrations', 'populated');
export const MigrationDetailsLoading = details('Migrations', 'loading');
export const MigrationDetailsError = details('Migrations', 'error');
export const MigrationDetailsEmpty = details('Migrations', 'empty');
export const MigrationDetailsPopulated = details('Migrations', 'populated');

export const DataVolumeListLoading = list('DataVolumes', 'loading');
export const DataVolumeListError = list('DataVolumes', 'error');
export const DataVolumeListEmpty = list('DataVolumes', 'empty');
export const DataVolumeListPopulated = list('DataVolumes', 'populated');
export const DataVolumeDetailsLoading = details('DataVolumes', 'loading');
export const DataVolumeDetailsError = details('DataVolumes', 'error');
export const DataVolumeDetailsEmpty = details('DataVolumes', 'empty');
export const DataVolumeDetailsPopulated = details('DataVolumes', 'populated');
