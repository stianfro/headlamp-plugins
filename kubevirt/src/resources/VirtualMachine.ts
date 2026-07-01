import { ApiProxy, K8s } from '@kinvolk/headlamp-plugin/lib';
import type { StreamArgs, StreamResultsCb } from '@kinvolk/headlamp-plugin/lib/lib/k8s/api/v1/streamingApi';
import { getSubresource, putSubresource, vmiSubUrl, vmSubUrl } from '../lib/subresources';
import type {
  KubeVirtVirtualMachine,
  VirtualMachineInstanceGuestAgentInfo,
  VirtualMachineSpec,
  VirtualMachineStatus,
} from '../typedefs';

function target(item: VirtualMachine): { namespace: string; name: string } {
  const namespace = item.getNamespace();
  const name = item.getName();

  if (!namespace || !name) {
    throw new Error('VirtualMachine requires a namespace and name');
  }

  return { namespace, name };
}

export class VirtualMachine extends K8s.cluster.KubeObject<KubeVirtVirtualMachine> {
  static kind = 'VirtualMachine';
  static apiVersion = 'kubevirt.io/v1';
  static apiName = 'virtualmachines';
  static isNamespaced = true;

  get spec(): VirtualMachineSpec {
    return this.jsonData.spec ?? {};
  }

  get status(): VirtualMachineStatus {
    return this.jsonData.status ?? {};
  }

  start(paused = false): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'start'), paused ? { paused: true } : {});
  }

  stop(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'stop'));
  }

  forceStop(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'stop'), { gracePeriod: 0 });
  }

  restart(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'restart'));
  }

  forceRestart(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'restart'), { gracePeriodSeconds: 0 });
  }

  migrate(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmSubUrl(namespace, name, 'migrate'));
  }

  pause(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'pause'));
  }

  unpause(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'unpause'));
  }

  softReboot(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'softreboot'));
  }

  guestOsInfo(): Promise<VirtualMachineInstanceGuestAgentInfo> {
    const { namespace, name } = target(this);
    return getSubresource<VirtualMachineInstanceGuestAgentInfo>(vmiSubUrl(namespace, name, 'guestosinfo'));
  }

  serialConsole(onData: StreamResultsCb<string | ArrayBuffer | Blob>, streamArgs?: StreamArgs) {
    const { namespace, name } = target(this);
    const additionalProtocols = [
      'plain.kubevirt.io',
      ...(streamArgs?.additionalProtocols?.filter(protocol => protocol !== 'plain.kubevirt.io') ?? []),
    ];

    return ApiProxy.stream<string | ArrayBuffer | Blob>(vmiSubUrl(namespace, name, 'console'), onData, {
      ...streamArgs,
      isJson: false,
      additionalProtocols,
    });
  }
}
