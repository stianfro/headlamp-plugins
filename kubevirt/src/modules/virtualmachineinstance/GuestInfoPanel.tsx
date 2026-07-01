import {
  Loader,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Alert, Typography } from '@mui/material';
import React from 'react';
import { isAgentConnected } from '../../lib/guestAgent';
import { VirtualMachineInstance } from '../../resources/VirtualMachineInstance';
import type { VirtualMachineInstanceGuestAgentInfo } from '../../typedefs';

interface GuestInfoPanelProps {
  item: VirtualMachineInstance;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function GuestInfoPanel({ item }: GuestInfoPanelProps) {
  const connected = isAgentConnected(item);
  const [guestInfo, setGuestInfo] = React.useState<VirtualMachineInstanceGuestAgentInfo | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    if (!connected) {
      setGuestInfo(null);
      setError(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError(null);

    void item
      .guestOsInfo()
      .then(info => {
        if (!cancelled) {
          setGuestInfo(info);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(errorMessage(err));
          setGuestInfo(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connected, item]);

  if (!connected) {
    return (
      <SectionBox title="Guest OS information">
        <Typography color="text.secondary">Guest agent not connected.</Typography>
      </SectionBox>
    );
  }

  if (loading) {
    return (
      <SectionBox title="Guest OS information">
        <Loader title="Loading guest OS information" />
      </SectionBox>
    );
  }

  if (error) {
    return (
      <SectionBox title="Guest OS information">
        <Alert severity="warning">Guest OS information could not be loaded: {error}</Alert>
      </SectionBox>
    );
  }

  const os = guestInfo?.os ?? {};

  return (
    <SectionBox title="Guest OS information">
      <NameValueTable
        rows={[
          { name: 'OS', value: os.prettyName ?? os.name ?? 'Unknown' },
          { name: 'Version', value: os.version ?? os.versionId ?? 'Unknown' },
          { name: 'Kernel release', value: os.kernelRelease ?? os.kernelVersion ?? 'Unknown' },
          { name: 'Architecture', value: os.machine ?? 'Unknown' },
          { name: 'Hostname', value: guestInfo?.hostname ?? 'Unknown' },
          { name: 'Timezone', value: guestInfo?.timezone ?? 'Unknown' },
          { name: 'Guest agent version', value: guestInfo?.guestAgentVersion ?? 'Unknown' },
          { name: 'Filesystem freeze status', value: guestInfo?.fsFreezeStatus ?? 'Unknown' },
        ]}
      />
    </SectionBox>
  );
}

export default GuestInfoPanel;
