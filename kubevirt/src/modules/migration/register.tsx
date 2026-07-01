import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { MigrationDetails } from './Details';
import { MigrationList } from './List';

export const MIGRATION_LIST_ROUTE = '/kubevirt/migrations';
export const MIGRATION_DETAILS_ROUTE = '/kubevirt/migrations/:namespace/:name';
export const MIGRATION_SIDEBAR = 'kv-migrations';

export function registerMigration(): void {
  registerSidebarEntry({
    parent: 'kubevirt',
    name: MIGRATION_SIDEBAR,
    label: 'Migrations',
    url: MIGRATION_LIST_ROUTE,
  });

  registerRoute({
    path: MIGRATION_DETAILS_ROUTE,
    sidebar: MIGRATION_SIDEBAR,
    exact: true,
    name: 'Migration',
    component: () => <MigrationDetails />,
  });

  registerRoute({
    path: MIGRATION_LIST_ROUTE,
    sidebar: MIGRATION_SIDEBAR,
    exact: true,
    name: 'Migrations',
    component: () => <MigrationList />,
  });
}
