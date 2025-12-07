/**
 * Configuration for Auth0, API, and external services
 */
export const config = {
    auth0: {
        domain: process.env.VITE_AUTH0_DOMAIN || 'YOUR_AUTH0_DOMAIN.auth0.com',
        clientId: process.env.VITE_AUTH0_CLIENT_ID || 'YOUR_AUTH0_CLIENT_ID',
        redirectUri: window.location.origin
    },
    api: {
        baseUrl: process.env.VITE_API_BASE_URL || 'https://api.your-domain.com',
        timeout: 10000
    },
    game: {
        name: 'Password Quest',
        version: '1.0.0'
    }
};
