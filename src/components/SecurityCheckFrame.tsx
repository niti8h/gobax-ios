import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

export interface SecurityCheckMessage {
  type?: unknown;
  status?: unknown;
  detail?: { secure?: unknown };
}

interface SecurityCheckFrameProps {
  url: string;
  onSecurityMessage: (message: SecurityCheckMessage) => void;
  onError: () => void;
}

const bridgeScript = `
  (function () {
    var relay = function (message) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          typeof message === 'string' ? message : JSON.stringify(message)
        );
      }
    };
    var parentWindow = window.parent;
    if (parentWindow && typeof parentWindow.postMessage === 'function') {
      var originalPostMessage = parentWindow.postMessage.bind(parentWindow);
      parentWindow.postMessage = function (message, targetOrigin, transfer) {
        relay(message);
        return originalPostMessage(message, targetOrigin, transfer);
      };
    }
  })();
  true;
`;

export const SecurityCheckFrame: React.FC<SecurityCheckFrameProps> = ({
  url,
  onSecurityMessage,
  onError,
}) => {
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      if (message && typeof message === 'object') {
        onSecurityMessage(message as SecurityCheckMessage);
      }
    } catch {
      // Ignore messages that are not valid JSON security-check payloads.
    }
  };

  return (
    <WebView
      source={{ uri: url }}
      style={styles.webView}
      originWhitelist={['https://gobax.010111902.workers.dev']}
      onMessage={handleMessage}
      injectedJavaScriptBeforeContentLoaded={bridgeScript}
      javaScriptEnabled
      domStorageEnabled
      onError={onError}
    />
  );
};

const styles = StyleSheet.create({
  webView: { flex: 1, backgroundColor: '#000000' },
});
