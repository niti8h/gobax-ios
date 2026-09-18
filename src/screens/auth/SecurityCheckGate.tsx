import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecurityCheckFrame, SecurityCheckResult } from '../../components/SecurityCheckFrame';

// If the page never reaches a verdict we surface an escape hatch rather than
// leaving anyone — including an App Review tester — stuck on a spinner.
const VERDICT_TIMEOUT_MS = 45000;

interface SecurityCheckGateProps {
  url: string;
  origin: string;
  onVerified: (token?: string) => Promise<void>;
  onBack: () => void;
}

export const SecurityCheckGate: React.FC<SecurityCheckGateProps> = ({
  url,
  origin,
  onVerified,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [frameKey, setFrameKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [completing, setCompleting] = useState(false);
  const settled = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (settled.current) return;
      settled.current = true;
      setErrorMessage('The security check is taking longer than expected.');
    }, VERDICT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [frameKey]);

  const retry = () => {
    settled.current = false;
    setCompleting(false);
    setErrorMessage('');
    setFrameKey(key => key + 1);
  };

  const fail = (message: string) => {
    settled.current = true;
    setCompleting(false);
    setErrorMessage(message);
  };

  const handleResult = async (result: SecurityCheckResult) => {
    if (settled.current) return;

    if (result.status !== 'secure') {
      fail(result.reason || 'The security check did not pass. Please try again.');
      return;
    }

    settled.current = true;
    setCompleting(true);
    try {
      await onVerified(result.token);
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SecurityCheckFrame
        key={frameKey}
        url={url}
        origin={origin}
        onResult={handleResult}
        onError={() => fail('The security check could not load. Check your connection and try again.')}
      />

      {completing ? (
        <View style={styles.statusOverlay}>
          <ActivityIndicator color="#00D06C" size="large" />
          <Text style={styles.statusTitle}>Signing you in…</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Security check could not continue</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backText}>Back to login</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Always reachable, so nobody can be trapped behind the check. */}
      {!errorMessage && !completing ? (
        <TouchableOpacity
          style={[styles.cancelBar, { paddingBottom: insets.bottom || 12 }]}
          onPress={onBack}
        >
          <Text style={styles.backText}>Cancel and return to login</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: 'rgba(3, 7, 18, 0.88)',
    justifyContent: 'center',
  },
  statusTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 14 },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    backgroundColor: '#030712',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errorMessage: { color: '#CBD5E1', fontSize: 15, marginTop: 10, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#00D06C',
    borderRadius: 10,
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  backButton: { marginTop: 18, padding: 8 },
  cancelBar: {
    alignItems: 'center',
    backgroundColor: '#030712',
    paddingTop: 12,
  },
  backText: { color: '#60A5FA', fontSize: 15, fontWeight: '600' },
});
