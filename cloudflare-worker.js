/**
 * Cloudflare Worker for Password Quest
 * Handles edge caching, CORS, security headers, and API proxying
 * 
 * Deploy with: npx wrangler deploy cloudflare-worker.js
 */

/**
 * Main request handler
 */
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname, search } = url;

        console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}${search}`);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }

        // Security headers
        const securityHeaders = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };

        try {
            // Route API requests to backend
            if (pathname.startsWith('/api/')) {
                return await routeApiRequest(request, env, corsHeaders, securityHeaders);
            }

            // Route static assets with caching
            if (pathname.match(/\.(js|css|png|jpg|gif|svg|woff2?|eot|ttf)$/)) {
                return await cacheStaticAsset(request, env, corsHeaders, securityHeaders);
            }

            // Default: proxy to origin
            return await proxyToOrigin(request, env, corsHeaders, securityHeaders);

        } catch (error) {
            console.error('Worker error:', error);
            return errorResponse(error, corsHeaders, securityHeaders);
        }
    }
};

/**
 * Route API requests to Vultr backend
 */
async function routeApiRequest(request, env, corsHeaders, securityHeaders) {
    const backendUrl = env.BACKEND_URL || 'https://api.password-quest.com';
    const url = new URL(request.url);
    
    const backendRequest = new Request(
        `${backendUrl}${url.pathname}${url.search}`,
        {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' ? request.body : undefined
        }
    );

    try {
        const response = await fetch(backendRequest);
        const responseText = await response.text();

        return new Response(responseText, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
                'Cache-Control': 'private, no-cache',
                ...corsHeaders,
                ...securityHeaders
            }
        });
    } catch (error) {
        console.error('Backend request error:', error);
        return errorResponse(error, corsHeaders, securityHeaders);
    }
}

/**
 * Cache static assets
 */
async function cacheStaticAsset(request, env, corsHeaders, securityHeaders) {
    const cacheKey = new Request(request.url, { method: 'GET' });
    const cache = caches.default;

    // Check cache
    let response = await cache.match(cacheKey);
    if (response) {
        console.log(`[CACHE HIT] ${request.url}`);
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'X-Cache': 'HIT',
                ...corsHeaders,
                ...securityHeaders
            }
        });
    }

    // Fetch from origin
    response = await fetch(request);
    
    if (response.status === 200) {
        // Cache for 1 year for immutable assets, 24 hours for others
        const cacheControl = request.url.includes('?') 
            ? 'public, max-age=86400'
            : 'public, max-age=31536000, immutable';

        const cachedResponse = new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'Cache-Control': cacheControl,
                'X-Cache': 'MISS',
                ...corsHeaders,
                ...securityHeaders
            }
        });

        ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
        return cachedResponse;
    }

    return response;
}

/**
 * Proxy request to origin
 */
async function proxyToOrigin(request, env, corsHeaders, securityHeaders) {
    const originUrl = env.ORIGIN_URL || 'https://password-quest.com';
    const url = new URL(request.url);
    
    const originRequest = new Request(
        `${originUrl}${url.pathname}${url.search}`,
        {
            method: request.method,
            headers: request.headers,
            body: request.method !== 'GET' ? request.body : undefined
        }
    );

    try {
        const response = await fetch(originRequest);
        
        return new Response(response.body, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers),
                'Cache-Control': 'public, max-age=3600',
                ...corsHeaders,
                ...securityHeaders
            }
        });
    } catch (error) {
        console.error('Origin proxy error:', error);
        return errorResponse(error, corsHeaders, securityHeaders);
    }
}

/**
 * Generate error response
 */
function errorResponse(error, corsHeaders, securityHeaders) {
    return new Response(
        JSON.stringify({
            error: 'Internal Server Error',
            message: error.message,
            timestamp: new Date().toISOString()
        }),
        {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
                ...securityHeaders
            }
        }
    );
}

/**
 * Track analytics event (optional)
 */
async function trackAnalytics(event, env) {
    if (env.ANALYTICS_DATASET) {
        try {
            await env.ANALYTICS_DATASET.writeDataPoint({
                indexes: [event.type, event.path],
                blobs: [JSON.stringify(event)],
                doubles: [Date.now()]
            });
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }
}

