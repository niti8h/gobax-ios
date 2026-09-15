import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecurityCheckFrame, SecurityCheckMessage } from '../../components/SecurityCheckFrame';

const SECURITY_CHECK_URL = 'https://gobax.010111902.workers.dev/security-check';

interface SecurityCheckGateProps {
  onSecure: () => Promise<void>;
  onBack: () => void;
}

export const SecurityCheckGate: React.FC<SecurityCheckGateProps> = ({ onSecure, onBack }) => {
  const insets = useSafeAreaInsets();
  const [frameKey, setFrameKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [completing, setCompleting] = useState(false);
  const completionStarted = useRef(false);

  const retry = () => {
    completionStarted.current = false;
    setCompleting(false);
    setErrorMessage('');
    setFrameKey((key) => key + 1);
  };

  const handleSecurityMessage = async (message: SecurityCheckMessage) => {
    const isSecure = message.type === 'SECURITY_CHECK'
      && (message.status === 'secure' || message.detail?.secure === true);
    if (!isSecure || completionStarted.current) return;

    completionStarted.current = true;
    setCompleting(true);
    try {
      await onSecure();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to log in. Please try again.');
      setCompleting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SecurityCheckFrame
        key={frameKey}
        url={SECURITY_CHECK_URL}
        onSecurityMessage={handleSecurityMessage}
        onError={() => setErrorMessage('Security check could not load. Please try again.')}
      />
      {completing ? (
        <View style={styles.statusOverlay}>
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
  statusTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
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
  backText: { color: '#60A5FA', fontSize: 15, fontWeight: '600' },
});
