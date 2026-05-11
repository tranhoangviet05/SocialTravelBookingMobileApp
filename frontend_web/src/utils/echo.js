import Echo from 'laravel-echo';
import PusherModule from 'pusher-js';
import axiosClient from '../api/axios';

// pusher-js v8.x xuất dạng { Pusher: [class] }, cần lấy đúng constructor
const Pusher = PusherModule.Pusher || PusherModule;

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    Pusher: Pusher,
    key: import.meta.env.VITE_REVERB_APP_KEY || 'stb_app_key',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => ({
        authorize: (socketId, callback) => {
            axiosClient.post('/broadcasting/auth', {
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
