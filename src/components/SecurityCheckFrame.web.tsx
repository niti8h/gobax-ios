import React, { useEffect, useRef } from 'react';

export interface SecurityCheckResult {
  status?: string;
  token?: string;
  reason?: string;
}

interface SecurityCheckFrameProps {
  url: string;
  origin: string;
  onResult: (result: SecurityCheckResult) => void;
  onError: () => void;
}

export const SecurityCheckFrame: React.FC<SecurityCheckFrameProps> = ({
  url,
  origin,
  onResult,
  onError,
}) => {
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only trust messages from the security-check origin itself.
      if (event.origin !== origin) return;
      const data = event.data as Record<string, unknown> | null;
      if (!data || typeof data !== 'object' || data.type !== 'SECURITY_CHECK') return;
      onResult({
        status: typeof data.status === 'string' ? data.status : undefined,
        token: typeof data.token === 'string' ? data.token : undefined,
        reason: typeof data.reason === 'string' ? data.reason : undefined,
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [origin, onResult]);

  return (
    <iframe
      ref={frameRef}
      src={url}
      onError={onError}
      style={{ border: 'none', flex: 1, height: '100%', width: '100%' }}
      title="Security check"
    />
  );
};
