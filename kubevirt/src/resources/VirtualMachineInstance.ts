import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import type { StreamArgs, StreamResultsCb } from '@kinvolk/headlamp-plugin/lib/lib/k8s/api/v1/streamingApi';
import { getSubresource, putSubresource, vmiSubUrl } from '../lib/subresources';
import type {
  KubeVirtVirtualMachineInstance,
  VirtualMachineInstanceGuestAgentInfo,
  VirtualMachineInstanceSpec,
  VirtualMachineInstanceStatus,
} from '../typedefs';

function target(item: VirtualMachineInstance): { namespace: string; name: string } {
  const namespace = item.getNamespace();
  const name = item.getName();

  if (!namespace || !name) {
    throw new Error('VirtualMachineInstance requires a namespace and name');
  }

  return { namespace, name };
}

export class VirtualMachineInstance extends KubeObject<KubeVirtVirtualMachineInstance> {
  static kind = 'VirtualMachineInstance';
  static apiVersion = 'kubevirt.io/v1';
  static apiName = 'virtualmachineinstances';
  static isNamespaced = true;

  get spec(): VirtualMachineInstanceSpec {
    return this.jsonData.spec ?? {};
  }

  get status(): VirtualMachineInstanceStatus {
    return this.jsonData.status ?? {};
  }

  pause(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'pause'));
  }

  unpause(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'unpause'));
  }

  freeze(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'freeze'));
  }

  unfreeze(): Promise<unknown> {
    const { namespace, name } = target(this);
    return putSubresource(vmiSubUrl(namespace, name, 'unfreeze'));
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
