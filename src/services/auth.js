/**
 * Auth0 Authentication Module - Deprecated
 * Use AuthService class instead
 * This file is maintained for backward compatibility
 */

import AuthService from './AuthService.js';

/**
 * Initialize Auth0 client
 */
export async function initAuth0() {
    try {
        await AuthService.init();
        return AuthService.auth0Client;
    } catch (error) {
        console.error('✗ Auth0: Failed to initialize:', error);
        throw error;
    }
}

/**
 * Handle Auth0 redirect callback
 */
export async function handleAuth0Redirect() {
    try {
        if (window.location.search.includes('code=') && 
            window.location.search.includes('state=')) {
            await AuthService.auth0Client?.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error('✗ Auth0: Error handling redirect:', error);
    }
}

/**
 * Login user with Auth0 redirect
 */
export async function login() {
    try {
        console.log('Auth0: Initiating login...');
        await AuthService.login();
        console.log('✓ Auth0: Login successful:', AuthService.user?.email);
        return AuthService.user;
    } catch (error) {
        console.error('✗ Auth0: Login failed:', error);
        throw error;
    }
}

/**
 * Logout user
 */
export async function logout() {
    try {
        console.log('Auth0: Logging out...');
        await AuthService.logout();
        console.log('✓ Auth0: Logout successful');
    } catch (error) {
        console.error('✗ Auth0: Logout failed:', error);
    }
}

/**
 * Get access token for API calls
 */
export async function getToken() {
    try {
        return await AuthService.getAccessToken();
    } catch (error) {
        console.error('✗ Auth0: Failed to get token:', error);
        throw error;
    }
}

/**
 * Get current user info
 */
export function getUser() {
    return AuthService.getUser();
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated() {
    return AuthService.isUserAuthenticated();
}

