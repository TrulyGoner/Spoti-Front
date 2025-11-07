// Конфигурация Spotify API
export const SPOTIFY_CONFIG = {
  // Замените на ваши credentials из Spotify Developer Dashboard
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
  
  // Redirect URI для OAuth (если будет использоваться)
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback',
  
  // Scopes для доступа к API
  SCOPES: [
    'user-read-private',
    'user-read-email',
  ].join(' '),
}


