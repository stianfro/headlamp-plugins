import { K8s } from '@kinvolk/headlamp-plugin/lib';
import type { DataVolumeSpec, DataVolumeStatus, KubeVirtDataVolume } from '../typedefs';

export class DataVolume extends K8s.cluster.KubeObject<KubeVirtDataVolume> {
  static kind = 'DataVolume';
  static apiVersion = 'cdi.kubevirt.io/v1beta1';
  static apiName = 'datavolumes';
  static isNamespaced = true;

  get spec(): DataVolumeSpec {
    return this.jsonData.spec ?? {};
  }

  get status(): DataVolumeStatus {
    return this.jsonData.status ?? {};
  }
}
