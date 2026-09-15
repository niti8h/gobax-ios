import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SECURITY_CHECK_URL = 'https://gobax.010111902.workers.dev/security-check';
// const SECURITY_CHECK_URL = 'https://google.com';

interface SecurityCheckScreenProps {
  onSecure: () => void;
}

const bridgeScript = `
(function () {
  function relay(message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }
  function handleMessage(event) {
    if (event.data && event.data.type === 'SECURITY_CHECK') relay(event.data);
  }
  window.addEventListener('message', handleMessage);
  window.addEventListener('securityCheckComplete', function (event) {
    relay({ type: 'SECURITY_CHECK', status: event.detail && event.detail.secure ? 'secure' : 'insecure' });
  });
  var originalPostMessage = window.parent.postMessage.bind(window.parent);
  window.parent.postMessage = function (message, targetOrigin, transfer) {
    relay(message);
    return originalPostMessage(message, targetOrigin, transfer);
  };
})();
true;
`;

export const SecurityCheckScreen: React.FC<SecurityCheckScreenProps> = ({ onSecure }) => {
  const insets = useSafeAreaInsets();
  const [webViewKey, setWebViewKey] = React.useState(0);
  const [loadError, setLoadError] = React.useState(false);
  const securityCheckUrl = SECURITY_CHECK_URL;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const isSecure = message?.status === 'secure' || message?.detail?.secure === true;
      if (message?.type === 'SECURITY_CHECK' && isSecure) onSecure();
    } catch {
    }
  };

  const handleLoadError = () => {
    setLoadError(true);
  };

  const retry = () => {
    setLoadError(false);
    setWebViewKey((key) => key + 1);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        key={webViewKey}
        source={{ uri: securityCheckUrl }}
        style={styles.webView}
        originWhitelist={['https://gobax.010111902.workers.dev']}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={bridgeScript}
        javaScriptEnabled
        domStorageEnabled
        allowsBackForwardNavigationGestures
        onError={handleLoadError}
      />
      {loadError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Security check could not load</Text>
          <Text style={styles.errorMessage}>
            The network connection was lost. Check your connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  webView: { flex: 1 },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  errorMessage: { color: '#CBD5E1', fontSize: 15, textAlign: 'center', marginTop: 10 },
  retryButton: {
    backgroundColor: '#00D06C',
    borderRadius: 10,
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
