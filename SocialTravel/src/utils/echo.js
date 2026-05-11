import { IP_LAN } from '../api/apiClient';

let echoInstance = null;

const getEcho = () => {
  if (echoInstance) return echoInstance;

  try {
    // pusher-js/react-native export: module.exports.Pusher = PusherClass
    // Nên phải truy cập qua .Pusher thay vì default import
    const PusherModule = require('pusher-js/react-native');
    const PusherClass = PusherModule.Pusher || PusherModule.default || PusherModule;

    // laravel-echo export: exports.default = EchoClass
    const EchoModule = require('laravel-echo');
    const EchoClass = EchoModule.default || EchoModule;

    // Gán vào window để Echo có thể tìm thấy nếu cần
    if (typeof window !== 'undefined') {
      window.Pusher = PusherClass;
    }

    echoInstance = new EchoClass({
      broadcaster: 'reverb',
      key: 'stb_app_key',
      wsHost: IP_LAN,
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      Pusher: PusherClass,
    });

    console.log('Echo initialized successfully!');
  } catch (err) {
    console.warn('Echo init failed:', err.message || err);
    // Mock object để app không crash
    echoInstance = {
      channel: () => ({ listen: () => ({}), stopListening: () => ({}) }),
      private: () => ({ listen: () => ({}), stopListening: () => ({}) }),
      disconnect: () => {},
    };
  }
  return echoInstance;
};

export default getEcho();
