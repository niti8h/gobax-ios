import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

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

// Relays only security-check payloads. Anything else the page posts is ignored,
// so an unrelated postMessage can never be mistaken for a verdict.
const bridgeScript = `
  (function () {
    var send = function (payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    };
    var accept = function (message) {
      if (!message || typeof message !== 'object') return;
      if (message.type !== 'SECURITY_CHECK') return;
      send({
        type: 'SECURITY_CHECK',
        status: message.status,
        token: message.token,
        reason: message.reason,
      });
    };
    var parentWindow = window.parent;
    if (parentWindow && typeof parentWindow.postMessage === 'function') {
      var originalPostMessage = parentWindow.postMessage.bind(parentWindow);
      parentWindow.postMessage = function (message, targetOrigin, transfer) {
        accept(message);
        return originalPostMessage(message, targetOrigin, transfer);
      };
    }
    window.addEventListener('message', function (event) { accept(event.data); });
    window.addEventListener('securityCheckComplete', function (event) {
      var detail = (event && event.detail) || {};
      accept({
        type: 'SECURITY_CHECK',
        status: detail.secure ? 'secure' : 'failed',
        token: detail.token,
        reason: detail.reason,
      });
    });
  })();
  true;
`;

export const SecurityCheckFrame: React.FC<SecurityCheckFrameProps> = ({
  url,
  origin,
  onResult,
  onError,
}) => {
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (message && typeof message === 'object') {
        const data = message as Record<string, unknown>;
        if (data.type !== 'SECURITY_CHECK') return;
        onResult({
          status: typeof data.status === 'string' ? data.status : undefined,
          token: typeof data.token === 'string' ? data.token : undefined,
          reason: typeof data.reason === 'string' ? data.reason : undefined,
        });
      }
    } catch {
      // Ignore payloads that are not valid security-check JSON.
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      style={styles.webView}
      originWhitelist={[origin]}
      onMessage={handleMessage}
      injectedJavaScriptBeforeContentLoaded={bridgeScript}
      javaScriptEnabled
      domStorageEnabled
      onError={onError}
      onHttpError={onError}
    />
  );
};

const styles = StyleSheet.create({
  webView: { flex: 1, backgroundColor: '#000000' },
});
