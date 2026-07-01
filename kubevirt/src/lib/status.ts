import type { PrintableStatus, VmiPhase } from '../typedefs';

export type StatusColor = 'success' | 'warning' | 'error' | 'default';

const VM_WARNING_STATUSES = new Set<string>([
  'Provisioning',
  'Starting',
  'Stopping',
  'Terminating',
  'Migrating',
  'WaitingForVolumeBinding',
  'WaitingForReceiver',
]);

const VM_ERROR_STATUSES = new Set<string>([
  'CrashLoopBackOff',
  'Unknown',
  'ErrorUnschedulable',
  'ErrImagePull',
  'ImagePullBackOff',
  'ErrorPvcNotFound',
  'DataVolumeError',
]);

const STATUS_LABELS: Record<string, string> = {
  ErrorUnschedulable: 'Unschedulable',
  ErrImagePull: 'Image pull error',
  ImagePullBackOff: 'Image pull backoff',
  ErrorPvcNotFound: 'PVC not found',
  DataVolumeError: 'DataVolume error',
  WaitingForVolumeBinding: 'Waiting for volume binding',
  WaitingForReceiver: 'Waiting for receiver',
  CrashLoopBackOff: 'Crash loop backoff',
};

export function vmStatusColor(status?: PrintableStatus | string | null): StatusColor {
  if (status === 'Running') {
    return 'success';
  }

  if (status && VM_WARNING_STATUSES.has(status)) {
    return 'warning';
  }

  if (status && VM_ERROR_STATUSES.has(status)) {
    return 'error';
  }

  return 'default';
}

export function vmiPhaseColor(phase?: VmiPhase | string | null): StatusColor {
  switch (phase) {
    case 'Running':
    case 'Succeeded':
      return 'success';
    case 'Pending':
    case 'Scheduling':
    case 'Scheduled':
      return 'warning';
    case 'Failed':
    case 'Unknown':
      return 'error';
    default:
      return 'default';
  }
}

export function displayStatus(value?: string | null): string {
  if (!value) {
    return 'Unknown';
  }

  return STATUS_LABELS[value] ?? value;
}
