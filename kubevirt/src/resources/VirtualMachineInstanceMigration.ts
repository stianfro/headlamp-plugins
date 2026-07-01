import { KubeObject } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';
import type {
  KubeVirtVirtualMachineInstanceMigration,
  VirtualMachineInstanceMigrationSpec,
  VirtualMachineInstanceMigrationStatus,
} from '../typedefs';

export class VirtualMachineInstanceMigration extends KubeObject<KubeVirtVirtualMachineInstanceMigration> {
  static kind = 'VirtualMachineInstanceMigration';
  static apiVersion = 'kubevirt.io/v1';
  static apiName = 'virtualmachineinstancemigrations';
  static isNamespaced = true;

  get spec(): VirtualMachineInstanceMigrationSpec {
    return this.jsonData.spec ?? {};
  }

  get status(): VirtualMachineInstanceMigrationStatus {
    return this.jsonData.status ?? {};
  }
}
