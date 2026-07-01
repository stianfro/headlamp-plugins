import { describe, expect, it } from 'vitest';
import { displayStatus, vmiPhaseColor,vmStatusColor } from '../lib/status';

describe('status helpers', () => {
  it('maps VM statuses to labels and colors', () => {
    expect(displayStatus('ErrImagePull')).toBe('Image pull error');
    expect(vmStatusColor('Running')).toBe('success');
    expect(vmStatusColor('ErrorPvcNotFound')).toBe('error');
  });

  it('maps VMI phases to colors', () => {
    expect(vmiPhaseColor('Running')).toBe('success');
    expect(vmiPhaseColor('Scheduling')).toBe('warning');
    expect(vmiPhaseColor('Failed')).toBe('error');
  });
});
