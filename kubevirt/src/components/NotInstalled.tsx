import { Icon } from '@iconify/react';
import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

export interface NotInstalledProps {
  resourceLabel?: string;
}

export function NotInstalled({ resourceLabel = 'virtualization resources' }: NotInstalledProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Stack spacing={2} alignItems="center" sx={{ maxWidth: 520, textAlign: 'center' }}>
        <Icon icon="mdi:server-off" width={56} />
        <Typography variant="h5">KubeVirt is not installed on this cluster</Typography>
        <Typography variant="body2" color="text.secondary">
          {resourceLabel} appear here once KubeVirt or OpenShift Virtualization is present.
        </Typography>
      </Stack>
    </Box>
  );
}

export default NotInstalled;
