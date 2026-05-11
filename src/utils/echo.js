import Echo from 'laravel-echo';
import PusherModule from 'pusher-js';
import apiClient, { IP_LAN } from '../api/apiClient';

// pusher-js v8.x xuất dạng { Pusher: [class] }, cần lấy đúng constructor
const Pusher = PusherModule.Pusher || PusherModule;

const echo = new Echo({
    broadcaster: 'reverb',
    Pusher: Pusher,
    key: 'stb_app_key',
    wsHost: IP_LAN,
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => ({
        authorize: (socketId, callback) => {
            apiClient.post('/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name
            })
            .then(response => {
                callback(null, response);
            })
            .catch(error => {
                callback(error);
            });
        }
    }),
});

export default echo;
