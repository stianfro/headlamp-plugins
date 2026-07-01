import type { KubeCondition, KubeMetadata } from '@kinvolk/headlamp-plugin/lib/K8s/cluster';

export type PrintableStatus =
  | 'Stopped'
  | 'Provisioning'
  | 'Starting'
  | 'Running'
  | 'Paused'
  | 'Stopping'
  | 'Terminating'
  | 'CrashLoopBackOff'
  | 'Migrating'
  | 'Unknown'
  | 'ErrorUnschedulable'
  | 'ErrImagePull'
  | 'ImagePullBackOff'
  | 'ErrorPvcNotFound'
  | 'DataVolumeError'
  | 'WaitingForVolumeBinding'
  | 'WaitingForReceiver';

export type VmiPhase =
  | 'Pending'
  | 'Scheduling'
  | 'Scheduled'
  | 'Running'
  | 'Succeeded'
  | 'Failed'
  | 'Unknown';

export type MigrationPhase =
  | 'Pending'
  | 'Scheduling'
  | 'Scheduled'
  | 'PreparingTarget'
  | 'TargetReady'
  | 'Running'
  | 'Succeeded'
  | 'Failed';

export type DataVolumePhase =
  | 'Pending'
  | 'ImportScheduled'
  | 'ImportInProgress'
  | 'Succeeded'
  | 'Failed'
  | 'WaitForFirstConsumer'
  | 'PVCBound'
  | string;

export interface ObjectReference {
  name?: string;
  namespace?: string;
  kind?: string;
  apiGroup?: string;
  [key: string]: unknown;
}

export interface NamedSource {
  name?: string;
  namespace?: string;
  [key: string]: unknown;
}

export interface KubeVirtCpuTopology {
  sockets?: number;
  cores?: number;
  threads?: number;
  [key: string]: unknown;
}

export interface KubeVirtMemory {
  guest?: string;
  hugepages?: {
    pageSize?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KubeVirtDisk {
  name: string;
  disk?: {
    bus?: string;
    [key: string]: unknown;
  };
  lun?: {
    bus?: string;
    [key: string]: unknown;
  };
  cdrom?: {
    bus?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KubeVirtInterface {
  name: string;
  model?: string;
  macAddress?: string;
  bridge?: Record<string, unknown>;
  masquerade?: Record<string, unknown>;
  slirp?: Record<string, unknown>;
  sriov?: Record<string, unknown>;
  binding?: {
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KubeVirtVolume {
  name: string;
  dataVolume?: NamedSource;
  persistentVolumeClaim?: NamedSource;
  containerDisk?: {
    image?: string;
    [key: string]: unknown;
  };
  cloudInitNoCloud?: Record<string, unknown>;
  cloudInitConfigDrive?: Record<string, unknown>;
  emptyDisk?: Record<string, unknown>;
  configMap?: NamedSource;
  secret?: NamedSource;
  serviceAccount?: NamedSource;
  downwardAPI?: Record<string, unknown>;
  hostDisk?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface KubeVirtNetwork {
  name: string;
  pod?: Record<string, unknown>;
  multus?: {
    networkName?: string;
    default?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KubeVirtDomainSpec {
  cpu?: {
    sockets?: number;
    cores?: number;
    threads?: number;
    [key: string]: unknown;
  };
  memory?: KubeVirtMemory;
  devices?: {
    disks?: KubeVirtDisk[];
    interfaces?: KubeVirtInterface[];
    [key: string]: unknown;
  };
  resources?: {
    requests?: Record<string, string>;
    limits?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface VirtualMachineInstanceSpec {
  domain?: KubeVirtDomainSpec;
  volumes?: KubeVirtVolume[];
  networks?: KubeVirtNetwork[];
  nodeSelector?: Record<string, string>;
  [key: string]: unknown;
}

export interface VirtualMachineSpec {
  running?: boolean;
  runStrategy?: string;
  template?: {
    metadata?: Partial<KubeMetadata>;
    spec?: VirtualMachineInstanceSpec;
  };
  instancetype?: ObjectReference;
  preference?: ObjectReference;
  dataVolumeTemplates?: KubeVirtDataVolume[];
  [key: string]: unknown;
}

export interface KubeVirtInterfaceStatus {
  name?: string;
  ipAddress?: string;
  ipAddresses?: string[];
  mac?: string;
  infoSource?: string;
  queueCount?: number;
  [key: string]: unknown;
}

export interface KubeVirtDiskStatus {
  name?: string;
  target?: string;
  bus?: string;
  serial?: string;
  [key: string]: unknown;
}

export interface KubeVirtMigrationState {
  startTimestamp?: string;
  endTimestamp?: string;
  sourceNode?: string;
  targetNode?: string;
  completed?: boolean;
  failed?: boolean;
  migrationUid?: string;
  mode?: string;
  [key: string]: unknown;
}

export interface VirtualMachineStatus {
  printableStatus?: PrintableStatus | string;
  conditions?: KubeCondition[];
  ready?: boolean;
  created?: boolean;
  [key: string]: unknown;
}

export interface VirtualMachineInstanceStatus {
  phase?: VmiPhase | string;
  nodeName?: string;
  interfaces?: KubeVirtInterfaceStatus[];
  disks?: KubeVirtDiskStatus[];
  migrationState?: KubeVirtMigrationState;
  conditions?: KubeCondition[];
  fsFreezeStatus?: string;
  [key: string]: unknown;
}

export interface KubeVirtObject<Spec, Status> {
  kind: string;
  apiVersion?: string;
  metadata: KubeMetadata;
  spec?: Spec;
  status?: Status;
  [key: string]: unknown;
}

export type KubeVirtVirtualMachine = KubeVirtObject<VirtualMachineSpec, VirtualMachineStatus>;
export type KubeVirtVirtualMachineInstance = KubeVirtObject<
  VirtualMachineInstanceSpec,
  VirtualMachineInstanceStatus
>;

export interface VirtualMachineInstanceMigrationSpec {
  vmiName?: string;
  [key: string]: unknown;
}

export interface VirtualMachineInstanceMigrationStatus {
  phase?: MigrationPhase | string;
  migrationState?: KubeVirtMigrationState;
  conditions?: KubeCondition[];
  [key: string]: unknown;
}

export type KubeVirtVirtualMachineInstanceMigration = KubeVirtObject<
  VirtualMachineInstanceMigrationSpec,
  VirtualMachineInstanceMigrationStatus
>;

export interface DataVolumeSource {
  http?: Record<string, unknown>;
  registry?: Record<string, unknown>;
  pvc?: Record<string, unknown>;
  blank?: Record<string, unknown>;
  imageio?: Record<string, unknown>;
  vddk?: Record<string, unknown>;
  s3?: Record<string, unknown>;
  gcs?: Record<string, unknown>;
  snapshot?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DataVolumeStorageSpec {
  resources?: {
    requests?: Record<string, string>;
    limits?: Record<string, string>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DataVolumeSpec {
  source?: DataVolumeSource;
  storage?: DataVolumeStorageSpec;
  pvc?: DataVolumeStorageSpec;
  [key: string]: unknown;
}

export interface DataVolumeStatus {
  phase?: DataVolumePhase;
  progress?: string;
  conditions?: KubeCondition[];
  [key: string]: unknown;
}

export type KubeVirtDataVolume = KubeVirtObject<DataVolumeSpec, DataVolumeStatus>;

export interface GuestAgentCommand {
  name?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface GuestAgentUser {
  userName?: string;
  domain?: string;
  loginTime?: number;
  [key: string]: unknown;
}

export interface GuestAgentFileSystemDisk {
  serial?: string;
  busType?: string;
  [key: string]: unknown;
}

export interface GuestAgentFileSystem {
  name?: string;
  mountPoint?: string;
  type?: string;
  usedBytes?: number;
  totalBytes?: number;
  disk?: GuestAgentFileSystemDisk[];
  [key: string]: unknown;
}

export interface VirtualMachineInstanceGuestAgentInfo {
  guestAgentVersion?: string;
  hostname?: string;
  os?: {
    name?: string;
    kernelRelease?: string;
    version?: string;
    prettyName?: string;
    versionId?: string;
    kernelVersion?: string;
    machine?: string;
    id?: string;
    [key: string]: unknown;
  };
  timezone?: string;
  fsFreezeStatus?: string;
  supportedCommands?: GuestAgentCommand[];
  userList?: GuestAgentUser[];
  fsInfo?: {
    filesystems?: GuestAgentFileSystem[];
    disks?: GuestAgentFileSystemDisk[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
