import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';

export const SUBRESOURCE_PREFIX = '/apis/subresources.kubevirt.io/v1';

export type VmSubresourceVerb = 'start' | 'stop' | 'restart' | 'migrate';
export type VmiSubresourceVerb =
  | 'pause'
  | 'unpause'
  | 'freeze'
  | 'unfreeze'
  | 'softreboot'
  | 'guestosinfo'
  | 'userlist'
  | 'filesystemlist'
  | 'console'
  | 'vnc';

export interface StartOptions {
  paused?: boolean;
}

export interface StopOptions {
  gracePeriod?: number;
}

export interface RestartOptions {
  gracePeriodSeconds?: number;
}

export type MigrateOptions = Record<string, never>;
export type EmptySubresourceOptions = Record<string, never>;

function segment(value: string): string {
  return encodeURIComponent(value);
}

export function vmSubUrl(namespace: string, name: string, verb: VmSubresourceVerb): string {
  return `${SUBRESOURCE_PREFIX}/namespaces/${segment(namespace)}/virtualmachines/${segment(name)}/${verb}`;
}

export function vmiSubUrl(namespace: string, name: string, verb: VmiSubresourceVerb): string {
  return `${SUBRESOURCE_PREFIX}/namespaces/${segment(namespace)}/virtualmachineinstances/${segment(
    name
  )}/${verb}`;
}

export function putSubresource(url: string, opts?: object): Promise<unknown> {
  return ApiProxy.request(url, {
    method: 'PUT',
    body: JSON.stringify(opts ?? {}),
    headers: { 'Content-Type': 'application/json' },
    isJSON: false,
  });
}

export function getSubresource<T>(url: string): Promise<T> {
  return ApiProxy.request(url, { method: 'GET' }) as Promise<T>;
}
