import React from 'react';

interface SecurityCheckMessage {
  type?: unknown;
  status?: unknown;
  detail?: { secure?: unknown };
}

interface SecurityCheckFrameProps {
  url: string;
  onSecurityMessage: (message: SecurityCheckMessage) => void;
  onError: () => void;
}

export const SecurityCheckFrame: React.FC<SecurityCheckFrameProps> = ({
  url,
  onSecurityMessage,
  onError,
}) => {
  const frameRef = React.useRef<HTMLIFrameElement | null>(null);

  React.useEffect(() => {
    const allowedOrigin = new URL(url).origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin || event.source !== frameRef.current?.contentWindow) {
        return;
      }
      if (event.data && typeof event.data === 'object') {
        onSecurityMessage(event.data as SecurityCheckMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSecurityMessage, url]);

  return React.createElement('iframe', {
    ref: frameRef,
    src: url,
    title: 'Security check',
    onError,
    style: {
      flex: 1,
      width: '100%',
      height: '100%',
      border: 'none',
      backgroundColor: '#000000',
    },
  });
};
