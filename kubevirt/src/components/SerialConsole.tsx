import '@xterm/xterm/css/xterm.css';
import { Dialog } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { Box, DialogContent, Typography } from '@mui/material';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';
import React from 'react';
import { VirtualMachineInstance } from '../resources/VirtualMachineInstance';

type ConsoleStream = ReturnType<VirtualMachineInstance['serialConsole']>;

export interface SerialConsoleProps {
  vmi: VirtualMachineInstance;
  open: boolean;
  onClose?: () => void;
}

function openSerialTransport(
  vmi: VirtualMachineInstance,
  onData: (data: string | ArrayBuffer | Blob) => void,
  onClose: () => void
): ConsoleStream {
  return vmi.serialConsole(onData, {
    reconnectOnFailure: false,
    failCb: onClose,
  });
}

function writeData(terminal: XTerm, data: string | ArrayBuffer | Blob): void {
  if (typeof data === 'string') {
    terminal.write(data);
    return;
  }

  if (data instanceof ArrayBuffer) {
    terminal.write(new TextDecoder().decode(data));
    return;
  }

  void data.text().then(text => terminal.write(text));
}

function sendToSocket(stream: ConsoleStream | null, data: string): void {
  const socket = stream?.getSocket();

  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(data);
  }
}

export function SerialConsole({ vmi, open, onClose }: SerialConsoleProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const terminalRef = React.useRef<XTerm | null>(null);
  const fitAddonRef = React.useRef<FitAddon | null>(null);
  const streamRef = React.useRef<ConsoleStream | null>(null);
  const dataDisposableRef = React.useRef<{ dispose: () => void } | null>(null);
  const [connectionText, setConnectionText] = React.useState('Disconnected');

  const fit = React.useCallback(() => {
    window.setTimeout(() => {
      fitAddonRef.current?.fit();
    }, 0);
  }, []);

  const closeStream = React.useCallback(() => {
    streamRef.current?.cancel();
    streamRef.current = null;
    dataDisposableRef.current?.dispose();
    dataDisposableRef.current = null;
    terminalRef.current?.dispose();
    terminalRef.current = null;
    fitAddonRef.current = null;
    setConnectionText('Disconnected');
  }, []);

  React.useEffect(() => {
    if (!open || !containerRef.current) {
      return undefined;
    }

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'Menlo, Monaco, Consolas, monospace',
      fontSize: 13,
      theme: {
        background: '#111827',
        foreground: '#f9fafb',
      },
    });
    const fitAddon = new FitAddon();

    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    terminal.focus();
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    fit();

    setConnectionText('Connecting');
    streamRef.current = openSerialTransport(
      vmi,
      data => {
        setConnectionText('Connected');
        writeData(terminal, data);
      },
      () => setConnectionText('Disconnected')
    );

    dataDisposableRef.current = terminal.onData(data => sendToSocket(streamRef.current, data));

    return closeStream;
  }, [closeStream, fit, open, vmi]);

  React.useEffect(() => {
    if (!open) {
      closeStream();
      return undefined;
    }

    window.addEventListener('resize', fit);

    return () => window.removeEventListener('resize', fit);
  }, [closeStream, fit, open]);

  const handleClose = React.useCallback(() => {
    closeStream();
    onClose?.();
  }, [closeStream, onClose]);

  const handlePaste = React.useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const text = event.clipboardData.getData('text/plain');

    if (text) {
      sendToSocket(streamRef.current, text);
      event.preventDefault();
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={`Serial console: ${vmi.getName()}`}
      withFullScreen
      onFullScreenToggled={fit}
      maxWidth="xl"
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            {connectionText}
          </Typography>
        </Box>
        <Box
          ref={containerRef}
          onPaste={handlePaste}
          sx={{ height: '70vh', minHeight: 420, bgcolor: '#111827', p: 1 }}
          tabIndex={0}
        />
      </DialogContent>
    </Dialog>
  );
}

export default SerialConsole;
