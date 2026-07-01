import { VirtualMachineInstance } from '../resources/VirtualMachineInstance';
import type { KubeVirtVirtualMachineInstance } from '../typedefs';

export function isAgentConnected(
  vmi: KubeVirtVirtualMachineInstance | VirtualMachineInstance | null | undefined
): boolean {
  const conditions = vmi instanceof VirtualMachineInstance ? vmi.status.conditions : vmi?.status?.conditions;

  return !!conditions?.some(condition => {
    return condition.type === 'AgentConnected' && condition.status === 'True';
  });
}
