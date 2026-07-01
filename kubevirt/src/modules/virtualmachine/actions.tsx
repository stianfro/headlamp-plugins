import { ActionButton, Resource } from '@kinvolk/headlamp-plugin/lib/components/common';
import type { HeaderAction } from '@kinvolk/headlamp-plugin/lib/redux/actionButtonsSlice';
import { useSnackbar } from 'notistack';
import React from 'react';
import { VirtualMachine } from '../../resources/VirtualMachine';
import { VirtualMachineInstance } from '../../resources/VirtualMachineInstance';
import type { KubeVirtVirtualMachineInstance } from '../../typedefs';

interface VirtualMachineActionConfig {
  id: string;
  description: string;
  icon: string;
  subresource: string;
  onRun: (item: VirtualMachine) => Promise<unknown> | void;
  successMessage?: string;
  authResource?: 'vm' | 'vmi';
}

function hasCondition(item: VirtualMachine, type: string, status = 'True'): boolean {
  return item.status.conditions?.some(condition => condition.type === type && condition.status === status) ?? false;
}

function actionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'The action failed';
}

function vmiAuthItem(item: VirtualMachine): VirtualMachineInstance {
  return new VirtualMachineInstance(
    {
      apiVersion: 'kubevirt.io/v1',
      kind: 'VirtualMachineInstance',
      metadata: {
        name: item.getName(),
        namespace: item.getNamespace(),
      },
    } as KubeVirtVirtualMachineInstance,
    item.cluster
  );
}

function authAction(
  item: VirtualMachine,
  config: VirtualMachineActionConfig,
  pendingAction: string | null,
  runAction: (config: VirtualMachineActionConfig) => void
): HeaderAction {
  const authItem = config.authResource === 'vmi' ? vmiAuthItem(item) : item;

  return {
    id: config.id,
    action: (
      <Resource.AuthVisible item={authItem} authVerb="update" subresource={config.subresource}>
        <ActionButton
          description={config.description}
          icon={config.icon}
          onClick={() => runAction(config)}
          iconButtonProps={{ disabled: pendingAction !== null }}
        />
      </Resource.AuthVisible>
    ),
  };
}

function consoleAction(item: VirtualMachine, onOpenConsole: () => void): HeaderAction {
  return {
    id: 'open-console',
    action: (
      <Resource.AuthVisible item={vmiAuthItem(item)} authVerb="get" subresource="console">
        <ActionButton description="Open serial console" icon="mdi:console" onClick={onOpenConsole} />
      </Resource.AuthVisible>
    ),
  };
}

export function isVirtualMachinePaused(item: VirtualMachine): boolean {
  return item.status.printableStatus === 'Paused' || hasCondition(item, 'Paused');
}

export function useVirtualMachineActions(onOpenConsole: () => void) {
  const { enqueueSnackbar } = useSnackbar();
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  const runAction = React.useCallback(
    async (item: VirtualMachine, config: VirtualMachineActionConfig) => {
      setPendingAction(config.id);

      try {
        await config.onRun(item);
        enqueueSnackbar(config.successMessage ?? `${config.description} requested`, { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(actionErrorMessage(error), { variant: 'error' });
      } finally {
        setPendingAction(null);
      }
    },
    [enqueueSnackbar]
  );

  return React.useCallback(
    (item: VirtualMachine | null): HeaderAction[] | null => {
      if (!item) {
        return null;
      }

      const status = item.status.printableStatus;
      const paused = isVirtualMachinePaused(item);
      const stopped = status === 'Stopped';
      const running = status === 'Running' && !paused;
      const runningOrPaused = running || paused;
      const actions: HeaderAction[] = [];
      const addAction = (config: VirtualMachineActionConfig) => {
        actions.push(authAction(item, config, pendingAction, actionConfig => void runAction(item, actionConfig)));
      };

      if (stopped) {
        addAction({
          id: 'start',
          description: 'Start',
          icon: 'mdi:play-circle',
          subresource: 'start',
          onRun: vm => vm.start(),
          successMessage: 'Start requested',
        });
        addAction({
          id: 'start-paused',
          description: 'Start paused',
          icon: 'mdi:play-pause',
          subresource: 'start',
          onRun: vm => vm.start(true),
          successMessage: 'Start paused requested',
        });
      }

      if (runningOrPaused) {
        addAction({
          id: 'stop',
          description: 'Stop',
          icon: 'mdi:stop-circle-outline',
          subresource: 'stop',
          onRun: vm => vm.stop(),
          successMessage: 'Stop requested',
        });
        addAction({
          id: 'force-stop',
          description: 'Force stop',
          icon: 'mdi:stop-circle',
          subresource: 'stop',
          onRun: vm => vm.forceStop(),
          successMessage: 'Force stop requested',
        });
      }

      if (running) {
        addAction({
          id: 'restart',
          description: 'Restart',
          icon: 'mdi:restart',
          subresource: 'restart',
          onRun: vm => vm.restart(),
          successMessage: 'Restart requested',
        });
        addAction({
          id: 'force-restart',
          description: 'Force restart',
          icon: 'mdi:restart-alert',
          subresource: 'restart',
          onRun: vm => vm.forceRestart(),
          successMessage: 'Force restart requested',
        });
        addAction({
          id: 'reboot-guest',
          description: 'Reboot guest',
          icon: 'mdi:restart',
          subresource: 'softreboot',
          authResource: 'vmi',
          onRun: vm => vm.softReboot(),
          successMessage: 'Guest reboot requested',
        });
        addAction({
          id: 'pause',
          description: 'Pause',
          icon: 'mdi:pause-circle',
          subresource: 'pause',
          authResource: 'vmi',
          onRun: vm => vm.pause(),
          successMessage: 'Pause requested',
        });
        addAction({
          id: 'migrate',
          description: 'Migrate',
          icon: 'mdi:swap-horizontal',
          subresource: 'migrate',
          onRun: vm => vm.migrate(),
          successMessage: 'Migration requested',
        });
      }

      if (paused) {
        addAction({
          id: 'unpause',
          description: 'Unpause',
          icon: 'mdi:play-circle',
          subresource: 'unpause',
          authResource: 'vmi',
          onRun: vm => vm.unpause(),
          successMessage: 'Unpause requested',
        });
      }

      if (runningOrPaused) {
        actions.push(consoleAction(item, onOpenConsole));
      }

      return actions;
    },
    [onOpenConsole, pendingAction, runAction]
  );
}
