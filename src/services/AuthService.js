import { createAuth0Client } from '@auth0/auth0-spa-js';

/**
 * AuthService - Handles user authentication with Auth0
 */
class AuthService {
    constructor() {
        this.auth0Client = null;
        this.user = null;
        this.isAuthenticated = false;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            this.auth0Client = await createAuth0Client({
                domain: import.meta.env.VITE_AUTH0_DOMAIN,
                clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
                authorizationParams: {
                    redirect_uri: window.location.origin,
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE
                },
                cacheLocation: 'localstorage'
            });

            // Check if user is authenticated
            this.isAuthenticated = await this.auth0Client.isAuthenticated();
            
            if (this.isAuthenticated) {
                this.user = await this.auth0Client.getUser();
                console.log('User authenticated:', this.user);
            }

            // Handle redirect callback after login
            if (window.location.search.includes('code=') && 
                window.location.search.includes('state=')) {
                try {
                    await this.auth0Client.handleRedirectCallback();
                    this.isAuthenticated = true;
                    this.user = await this.auth0Client.getUser();
                    window.history.replaceState({}, document.title, '/');
                    console.log('Login successful:', this.user);
                } catch (error) {
                    console.error('Error handling redirect:', error);
                }
            }

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Auth0:', error);
            throw error;
        }
    }

    async login() {
        if (!this.auth0Client) {
            await this.init();
        }
        
        try {
            await this.auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.location.origin
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        if (!this.auth0Client) return;
        
        try {
            await this.auth0Client.logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            });
            this.isAuthenticated = false;
            this.user = null;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getAccessToken() {
        if (!this.isAuthenticated || !this.auth0Client) return null;
        
        try {
            return await this.auth0Client.getTokenSilently();
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    getUser() {
        return this.user;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    getUserName() {
        if (!this.user) return 'Guest';
        return this.user.name || this.user.nickname || this.user.email || 'Player';
    }
}

export default new AuthService();
