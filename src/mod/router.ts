/* eslint-disable @typescript-eslint/no-explicit-any */
// src/mod/router.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { signal, computed, type Signal }    from '@minejs/signals';
    import { jsx, Suspense }                    from '@minejs/jsx';
    import * as types                           from '../types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    class RouteNode {
        constructor(
            public segment: string,
            public route: types.Route | null = null,
            public children: Map<string, RouteNode> = new Map(),
            public paramName?: string,
            public isWildcard = false
        ) { }
    }

    class RouteMatcher {
        private root = new RouteNode('');
        private wildcardRoute: types.Route | null = null;

        addRoute(route: types.Route, parentPath = ''): void {
            const fullPath = parentPath + route.path;

            // Handle wildcard routes
            if (fullPath === '/*' || fullPath === '*') {
                this.wildcardRoute = route;
                return;
            }

            const segments = fullPath.split('/').filter(Boolean);
            let node = this.root;

            for (const segment of segments) {
                const isParam = segment.startsWith(':');
                const key = isParam ? ':param' : segment;

                if (!node.children.has(key)) {
                    node.children.set(key, new RouteNode(
                        segment,
                        null,
                        new Map(),
                        isParam ? segment.slice(1) : undefined
                    ));
                }

                node = node.children.get(key)!;
            }

            node.route = route;

            // Add child routes recursively
            if (route.children) {
                route.children.forEach(child => this.addRoute(child, fullPath));
            }
        }

        match(pathname: string): types.RouteMatch | null {
            const segments = pathname.split('/').filter(Boolean);
            const params: types.RouteParams = {};

            let node = this.root;
            let matchedRoute: types.Route | null = null;

            for (const segment of segments) {
                // Try exact match first
                if (node.children.has(segment)) {
                    node = node.children.get(segment)!;
                }
                // Try param match
                else if (node.children.has(':param')) {
                    const paramNode = node.children.get(':param')!;
                    params[paramNode.paramName!] = decodeURIComponent(segment);
                    node = paramNode;
                }
                // No exact match - try wildcard
                else {
                    matchedRoute = this.wildcardRoute;
                    break;
                }
            }

            matchedRoute = matchedRoute || node.route;

            if (!matchedRoute) {
                return null;
            }

            const url = new URL(window.location.href);

            return {
                path: pathname,
                params,
                query: url.searchParams,
                hash: url.hash.slice(1),
                route: matchedRoute
            };
        }
    }

    export class Router {
        private matcher = new RouteMatcher();
        private config  : types.RouterConfig;

        // Reactive state
        public currentRoute = signal<types.RouteMatch | null>(null);
        public isNavigating = signal(false);
        public loaderData   = signal<any>(null);
        public error        = signal<types.NavigationError | null>(null);

        // History
        private history      : types.RouteMatch[] = [];
        private historyIndex = 0;
        private maxHistory   = 50; // Prevent memory leaks

        // Guards
        private beforeEachGuards: ((to: types.RouteMatch, from: types.RouteMatch | null) => boolean | Promise<boolean>)[] = [];
        private afterEachGuards : ((to: types.RouteMatch, from: types.RouteMatch | null) => void)[] = [];
        private onErrorHandlers: ((error: types.NavigationError) => void)[] = [];

        constructor(config: types.RouterConfig) {
            this.config = {
                mode            : 'history',
                base            : '',
                scrollBehavior  : 'auto',
                ...config
            };

            // Add error handler
            if (config.onError) {
                this.onErrorHandlers.push(config.onError);
            }

            // Build route tree
            config.routes.forEach(route => this.matcher.addRoute(route));

            // Listen to browser navigation
            this.setupListeners();

            // Initial route - handle synchronously for basic setup
            this.performNavigation(window.location.pathname + window.location.search);
        }

        private emitError(error: types.NavigationError): void {
            this.error.set(error);
            this.onErrorHandlers.forEach(handler => handler(error));
        }

        private setupListeners(): void {
            if (this.config.mode === 'history') {
                window.addEventListener('popstate', () => {
                    this.handleNavigation(window.location.pathname + window.location.search);
                });
            } else {
                window.addEventListener('hashchange', () => {
                    const hash = window.location.hash.slice(1);
                    this.handleNavigation(hash || '/');
                });
            }

            // Intercept link clicks
            document.addEventListener('click', (e) => {
                const target = (e.target as HTMLElement).closest('a');

                if (!target || !target.href) return;

                // Check if it's a same-origin link
                const url = new URL(target.href);
                if (url.origin !== window.location.origin) return;

                // Check if it should be handled by router
                if (target.hasAttribute('data-external')) return;
                if (target.getAttribute('target') === '_blank') return;
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;

                e.preventDefault();
                this.push(url.pathname + url.search);
            });
        }

        private performNavigation(pathname: string, options: types.NavigateOptions = {}): void {
            try {
                // Extract path and query string
                const [pathOnly, queryString] = pathname.split('?');
                
                // Parse and filter query params
                const url = new URL('http://localhost' + pathOnly + (queryString ? '?' + queryString : ''));
                
                if (this.config.allowedQueryParams && this.config.allowedQueryParams.length > 0) {
                    const keys = Array.from(url.searchParams.keys());
                    keys.forEach(key => {
                        const isAllowed = this.config.allowedQueryParams!.some(pattern => {
                            if (typeof pattern === 'string') return pattern === key;
                            return pattern.test(key);
                        });
                        
                        if (!isAllowed) {
                            url.searchParams.delete(key);
                        }
                    });
                }

                const finalQueryString = url.searchParams.toString();
                const finalPathname = pathOnly + (finalQueryString ? '?' + finalQueryString : '');

                const match = this.matcher.match(pathOnly);

                if (!match) {
                    const error = new types.NavigationError('ROUTE_NOT_FOUND', `No route matched: ${pathOnly}`);
                    this.emitError(error);
                    return;
                }

                // Update browser history first (so window.location is correct for subsequent operations)
                if (this.config.mode === 'history') {
                    if (options.replace) {
                        window.history.replaceState(options.state || {}, '', finalPathname);
                    } else {
                        window.history.pushState(options.state || {}, '', finalPathname);
                    }
                } else {
                    window.location.hash = finalPathname;
                }

                match.query = url.searchParams;
                match.path = pathOnly;

                // Check guards synchronously (if they're not async)
                const canNavigate = this.checkSyncGuards(match, this.currentRoute());
                if (canNavigate === false) {
                    // Revert history if navigation was prevented
                    window.history.back();
                    return;
                }

                // Clear previous error
                this.error.set(null);

                // Update current route immediately (synchronously)
                this.currentRoute.set(match);

                // Handle scroll
                this.handleScroll(options.scroll);

                // Update document title and meta tags
                this.updateMetaTags(match.route.meta);

                // Manage history size to prevent memory leaks
                this.pruneHistory();

                // Add to history
                this.history.push(match);
                this.historyIndex = this.history.length - 1;

                // Run async operations in background
                this.runAsyncNavigation(pathname, match, options);
            } catch (err) {
                const error = new types.NavigationError(
                    'GUARD_ERROR',
                    'Navigation failed: ' + String(err),
                    err instanceof Error ? err : undefined
                );
                this.emitError(error);
            }
        }

        private updateMetaTags(meta?: Record<string, any>): void {
            if (!meta) return;

            if (meta.title) {
                document.title = meta.title;
            }
            if (meta.description) {
                const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
                if (descMeta) {
                    descMeta.content = meta.description;
                } else {
                    const newMeta = document.createElement('meta');
                    newMeta.name = 'description';
                    newMeta.content = meta.description;
                    document.head.appendChild(newMeta);
                }
            }
        }

        private pruneHistory(): void {
            if (this.history.length > this.maxHistory) {
                this.history = this.history.slice(-this.maxHistory);
                this.historyIndex = this.history.length - 1;
            }
        }

        private checkSyncGuards(to: types.RouteMatch, from: types.RouteMatch | null): boolean | undefined {
            // If no guards, return undefined (allow)
            if (this.beforeEachGuards.length === 0) {
                return undefined;
            }

            // Check guards - if any are async, we'll check them in runAsyncNavigation
            for (const guard of this.beforeEachGuards) {
                const result = guard(to, from);
                // If we got a Promise, we can't handle it synchronously
                if (result instanceof Promise) {
                    return undefined; // Let async handler deal with it
                }
                if (result === false) {
                    return false;
                }
            }
            return true;
        }

        private async runAsyncNavigation(pathname: string, match: types.RouteMatch, _options: types.NavigateOptions): Promise<void> {
            try {
                // Run beforeEach guards (including async ones)
                const canNavigate = await this.runBeforeEachGuards(match, match);
                if (!canNavigate) {
                    // Revert - remove from current and history
                    this.currentRoute.set(null);
                    this.history.pop();
                    this.historyIndex = Math.max(-1, this.history.length - 1);
                    // Revert in browser
                    window.history.back();
                    return;
                }

                const previousRoute = match;

                // Set navigating state
                this.isNavigating.set(true);

                try {
                    // Run loader if exists
                    if (match.route.loader) {
                        const context: types.RouteContext = {
                            params: match.params,
                            query: match.query,
                            request: new Request(window.location.href),
                            pathname
                        };

                        try {
                            const data = await match.route.loader(context);
                            this.loaderData.set(data);
                        } catch (err) {
                            const error = new types.NavigationError(
                                'LOADER_ERROR',
                                `Failed to load data for ${pathname}`,
                                err instanceof Error ? err : undefined
                            );
                            this.emitError(error);
                            throw error;
                        }
                    } else {
                        this.loaderData.set(null);
                    }

                    // Run afterEach guards
                    this.runAfterEachGuards(match, previousRoute);

                } finally {
                    this.isNavigating.set(false);
                }
            } catch (err) {
                if (err instanceof types.NavigationError) {
                    throw err;
                }
                const error = new types.NavigationError(
                    'GUARD_ERROR',
                    'Async navigation failed',
                    err instanceof Error ? err : undefined
                );
                this.emitError(error);
            }
        }

        private async handleNavigation(pathname: string, options: types.NavigateOptions = {}): Promise<void> {
            this.performNavigation(pathname, options);
        }

        private async runBeforeEachGuards(
            to: types.RouteMatch,
            from: types.RouteMatch | null
        ): Promise<boolean> {
            for (const guard of this.beforeEachGuards) {
                const result = await guard(to, from);
                if (result === false) return false;
            }
            return true;
        }

        private runAfterEachGuards(to: types.RouteMatch, from: types.RouteMatch | null): void {
            this.afterEachGuards.forEach(guard => guard(to, from));
        }

        private handleScroll(behavior?: boolean | 'smooth'): void {
            if (behavior === false) return;

            const scrollBehavior = typeof behavior === 'string'
                ? behavior
                : this.config.scrollBehavior;

            if (typeof window !== 'undefined' && window.scrollTo) {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: scrollBehavior === 'smooth' ? 'smooth' : 'auto'
                });
            }
        }

        // ============================================================================
        // PUBLIC API
        // ============================================================================

        /**
         * Navigate to a path
         */
        public push(path: string, options: types.NavigateOptions = {}): void {
            this.handleNavigation(path, { ...options, replace: false });
        }

        /**
         * Replace current route
         */
        public replace(path: string, options: types.NavigateOptions = {}): void {
            this.handleNavigation(path, { ...options, replace: true });
        }

        /**
         * Go back in history
         */
        public back(): void {
            window.history.back();
        }

        /**
         * Go forward in history
         */
        public forward(): void {
            window.history.forward();
        }

        /**
         * Go to specific history entry
         */
        public go(delta: number): void {
            window.history.go(delta);
        }

        /**
         * Check if path is active
         */
        public isActive(path: string, exact = false): boolean {
            const current = this.currentRoute();
            if (!current) return false;

            if (exact) {
                return current.path === path;
            }

            return current.path.startsWith(path);
        }

        /**
         * Get current params
         */
        public getParams(): types.RouteParams {
            return this.currentRoute()?.params || {};
        }

        /**
         * Get current query
         */
        public getQuery(): URLSearchParams {
            return this.currentRoute()?.query || new URLSearchParams();
        }

        /**
         * Register beforeEach guard
         */
        public beforeEach(
            guard: (to: types.RouteMatch, from: types.RouteMatch | null) => boolean | Promise<boolean>
        ): () => void {
            this.beforeEachGuards.push(guard);
            return () => {
                const index = this.beforeEachGuards.indexOf(guard);
                if (index > -1) this.beforeEachGuards.splice(index, 1);
            };
        }

        /**
         * Register afterEach guard
         */
        public afterEach(
            guard: (to: types.RouteMatch, from: types.RouteMatch | null) => void
        ): () => void {
            this.afterEachGuards.push(guard);
            return () => {
                const index = this.afterEachGuards.indexOf(guard);
                if (index > -1) this.afterEachGuards.splice(index, 1);
            };
        }

        /**
         * Register error handler
         */
        public onError(handler: (error: types.NavigationError) => void): () => void {
            this.onErrorHandlers.push(handler);
            return () => {
                const index = this.onErrorHandlers.indexOf(handler);
                if (index > -1) this.onErrorHandlers.splice(index, 1);
            };
        }

        /**
         * Add a query param to the whitelist
         */
        public addAllowedQueryParam(param: string | RegExp): void {
            if (!this.config.allowedQueryParams) {
                this.config.allowedQueryParams = [];
            }
            this.config.allowedQueryParams.push(param);
        }

        /**
         * Reload current route
         */
        public async reload(): Promise<void> {
            const current = this.currentRoute();
            if (current) {
                const queryString = current.query.toString();
                const pathWithQuery = current.path + (queryString ? '?' + queryString : '');
                await this.handleNavigation(pathWithQuery, { replace: true });
            }
        }

        /**
         * Destroy router and cleanup
         */
        public destroy(): void {
            this.history = [];
            this.beforeEachGuards = [];
            this.afterEachGuards = [];
            this.onErrorHandlers = [];
            this.currentRoute.set(null);
            this.loaderData.set(null);
            this.error.set(null);
        }
    }

    let globalRouter: Router | null = null;

    export function createRouter(config: types.RouterConfig): Router {
        globalRouter = new Router(config);
        return globalRouter;
    }

    export function useRouter(): Router {
        if (!globalRouter) {
            throw new Error('Router not initialized. Call createRouter() first.');
        }
        return globalRouter;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HOOK ════════════════════════════════════════╗

    export function useRoute(): Signal<types.RouteMatch | null> {
        return useRouter().currentRoute;
    }

    export function useParams(): types.RouteParams {
        return useRouter().getParams();
    }

    export function useQuery(): URLSearchParams {
        return useRouter().getQuery();
    }

    export function useLoaderData<T = any>(): Signal<T | null> {
        return useRouter().loaderData as Signal<T | null>;
    }

    export function useNavigate() {
        const router = useRouter();

        return {
            push: (path: string, options?: types.NavigateOptions) => router.push(path, options),
            replace: (path: string, options?: types.NavigateOptions) => router.replace(path, options),
            back: () => router.back(),
            forward: () => router.forward(),
            go: (delta: number) => router.go(delta)
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    /**
     * Link component with active state
     */
    export function Link(props: {
        to              : string
        children        : any
        activeClass?    : string
        exact?          : boolean
        replace?        : boolean
        className?      : string
        [key: string]   : any
    }) {
        const router   = useRouter();
        const isActive = computed(() => router.isActive(props.to, props.exact));

        const className = computed(() => {
            let classes = props.className || '';
            if (isActive() && props.activeClass) {
                classes += ' ' + props.activeClass;
            }
            return classes.trim();
        });

        const handleClick = (e: Event) => {
            e.preventDefault();

            if (props.replace) {
                router.replace(props.to);
            } else {
                router.push(props.to);
            }
        };

        return jsx('a', {
            href            : props.to,
            className       : className(),
            onClick         : handleClick,
            'data-active'   : isActive(),
            children        : props.children
        });
    }

    /**
     * Router outlet - renders current route component with error boundary
     */
    export function RouterOutlet() {
        const router = useRouter();
        const route = router.currentRoute;
        const error = router.error;

        return computed(() => {
            const currentRoute = route();
            const currentError = error();

            // Show error component if error occurred
            if (currentError) {
                const errorComponent = currentRoute?.route.errorComponent || router.currentRoute()?.route.meta?.errorComponent;
                if (errorComponent) {
                    return errorComponent();
                }
                // Fallback error display
                return jsx('div', {
                    style: { color: 'red', padding: '20px' },
                    children: `Navigation Error: ${currentError.message}`
                });
            }

            if (!currentRoute) {
                const notFoundComponent = (router.currentRoute() as any)?.config?.notFoundComponent;
                if (notFoundComponent) {
                    return notFoundComponent();
                }
                return null;
            }

            // Load and render component
            const component = currentRoute.route.component();

            if (component instanceof Promise) {
                // Async component
                return jsx(Suspense, {
                    fallback: jsx('div', { children: 'Loading...' }),
                    children: component
                });
            }

            return component;
        });
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ UTIL ════════════════════════════════════════╗

    /**
     * Build URL with params
     */
    export function buildPath(path: string, params: types.RouteParams): string {
        let result = path;

        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`:${key}`, encodeURIComponent(value));
        });

        return result;
    }

    /**
     * Parse query string to object
     */
    export function parseQuery(search: string): Record<string, string> {
        const params = new URLSearchParams(search);
        const result: Record<string, string> = {};

        params.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }

    /**
     * Stringify object to query string
     */
    export function stringifyQuery(obj: Record<string, any>): string {
        const params = new URLSearchParams();

        Object.entries(obj).forEach(([key, value]) => {
            if (value != null) {
                params.append(key, String(value));
            }
        });

        return params.toString();
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ ════ ════════════════════════════════════════╗

    export default {
        createRouter,
        useRouter,
        useRoute,
        useParams,
        useQuery,
        useLoaderData,
        useNavigate,
        Link,
        RouterOutlet,
        buildPath,
        parseQuery,
        stringifyQuery,
        Router,
        NavigationError: types.NavigationError
    };

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
