import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.glowyou',
  appName: 'Glow You',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  server: {
    androidScheme: 'http',
    cleartext: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    }
  }
};

export default config;
