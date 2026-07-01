import CustomResourceDefinition from '@kinvolk/headlamp-plugin/lib/K8s/crd';

export type KubevirtInstalledState = 'loading' | 'installed' | 'absent';

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { status?: number; message?: string; reason?: string };

  return (
    maybeError.status === 404 ||
    maybeError.reason === 'NotFound' ||
    maybeError.message?.toLowerCase().includes('not found') === true
  );
}

export function useKubevirtInstalled(): KubevirtInstalledState {
  const [crd, error] = CustomResourceDefinition.useGet('virtualmachines.kubevirt.io');

  if (crd) {
    return 'installed';
  }

  if (error) {
    return isNotFound(error) ? 'absent' : 'installed';
  }

  return 'loading';
}
