import * as _minejs_browser from '@minejs/browser';
import { EventsManager, WindowManager } from '@minejs/browser';
import * as _minejs_signals from '@minejs/signals';
import { Signal } from '@minejs/signals';
import { ClientManagerConfig, ClientManagerHooks } from '@cruxjs/base';
export { ClientExtension, ClientManagerConfig, ClientManagerHooks, ExtensionContext, LangConfig, RouteComponent, ThemeConfig } from '@cruxjs/base';

type RouteParams = Record<string, string>;
interface RouteMatch {
    path: string;
    params: RouteParams;
    query: URLSearchParams;
    hash: string;
    route: Route;
}
interface RouteContext {
    params: RouteParams;
    query: URLSearchParams;
    request: Request;
    pathname: string;
}
declare class NavigationError extends Error {
    code: 'LOADER_ERROR' | 'ACTION_ERROR' | 'GUARD_ERROR' | 'ROUTE_NOT_FOUND';
    cause?: Error | undefined;
    constructor(code: 'LOADER_ERROR' | 'ACTION_ERROR' | 'GUARD_ERROR' | 'ROUTE_NOT_FOUND', message: string, cause?: Error | undefined);
}
type LoaderFunction<T = any> = (context: RouteContext) => T | Promise<T>;
type ActionFunction<T = any> = (context: RouteContext) => T | Promise<T>;
interface Route {
    path: string;
    component: () => any | Promise<any>;
    loader?: LoaderFunction;
    action?: ActionFunction;
    children?: Route[];
    meta?: {
        title?: string;
        description?: string;
        [key: string]: any;
    };
    errorComponent?: () => any;
}
interface NavigateOptions {
    replace?: boolean;
    state?: any;
    scroll?: boolean | 'smooth';
}
interface RouterConfig {
    routes: Route[];
    base?: string;
    mode?: 'history' | 'hash';
    scrollBehavior?: 'auto' | 'smooth' | 'instant';
    allowedQueryParams?: (string | RegExp)[];
    notFoundComponent?: () => any;
    errorComponent?: () => any;
    onError?: (error: NavigationError) => void;
}

declare class Router {
    private matcher;
    private config;
    currentRoute: Signal<RouteMatch | null>;
    isNavigating: Signal<boolean>;
    loaderData: Signal<any>;
    error: Signal<NavigationError | null>;
    private history;
    private historyIndex;
    private maxHistory;
    private beforeEachGuards;
    private afterEachGuards;
    private onErrorHandlers;
    constructor(config: RouterConfig);
    private emitError;
    private setupListeners;
    private performNavigation;
    private updateMetaTags;
    private pruneHistory;
    private checkSyncGuards;
    private runAsyncNavigation;
    private handleNavigation;
    private runBeforeEachGuards;
    private runAfterEachGuards;
    private handleScroll;
    /**
     * Navigate to a path
     */
    push(path: string, options?: NavigateOptions): void;
    /**
     * Replace current route
     */
    replace(path: string, options?: NavigateOptions): void;
    /**
     * Go back in history
     */
    back(): void;
    /**
     * Go forward in history
     */
    forward(): void;
    /**
     * Go to specific history entry
     */
    go(delta: number): void;
    /**
     * Check if path is active
     */
    isActive(path: string, exact?: boolean): boolean;
    /**
     * Get current params
     */
    getParams(): RouteParams;
    /**
     * Get current query
     */
    getQuery(): URLSearchParams;
    /**
     * Register beforeEach guard
     */
    beforeEach(guard: (to: RouteMatch, from: RouteMatch | null) => boolean | Promise<boolean>): () => void;
    /**
     * Register afterEach guard
     */
    afterEach(guard: (to: RouteMatch, from: RouteMatch | null) => void): () => void;
    /**
     * Register error handler
     */
    onError(handler: (error: NavigationError) => void): () => void;
    /**
     * Add a query param to the whitelist
     */
    addAllowedQueryParam(param: string | RegExp): void;
    /**
     * Reload current route
     */
    reload(): Promise<void>;
    /**
     * Destroy router and cleanup
     */
    destroy(): void;
}

declare class ClientManager {
    private router;
    private eventsManager;
    private windowManager;
    private lifecycle;
    private config;
    private hooks;
    private extensions;
    private debug;
    private routeComponents;
    private currentPathSignal;
    constructor(config: ClientManagerConfig);
    /**
     * Setup lifecycle hooks OR bind events
     * Overloaded: on(event: 'onBoot'|'onReady'|'onDestroy', callback) - lifecycle
     *             on(target, event, handler) - event binding
     */
    on(event: keyof ClientManagerHooks, callback: any): this;
    on<K extends keyof HTMLElementEventMap>(target: EventTarget, event: K | string, handler: EventListener, options?: AddEventListenerOptions): () => void;
    /**
     * Bootstrap the app - Phase 1: BOOT
     */
    boot(): Promise<void>;
    /**
     * Ready the app - Phase 2: READY
     * Mount to DOM and make everything live
     *
     * Root selector is always 'body'.
     */
    ready(): Promise<void>;
    /**
     * Shutdown the app - Phase 3: DESTROY
     */
    destroy(): Promise<void>;
    /**
     * Navigate to path
     */
    navigate(path: string): void;
    /**
     * Mount router to DOM element and setup reactive routing
     * Automatically re-renders when route changes
     * If rootLayout is provided, it wraps all pages
     */
    mount(selector: string | HTMLElement): void;
    /**
     * Get current path signal for reactivity
     */
    getCurrentPath(): _minejs_signals.Signal<string>;
    /**
     * Create navigation link handler
     */
    createLinkHandler(path: string): (e: MouseEvent) => void;
    /**
     * Get underlying router for advanced usage
     */
    getRouter(): Router;
    /**
     * Unbind event
     */
    off(target: EventTarget, event: string, handler: EventListener): void;
    /**
     * Get events manager directly
     */
    getEventsManager(): EventsManager;
    /**
     * Get viewport info as reactive signal
     */
    getViewport(): _minejs_signals.Signal<_minejs_browser.ViewportInfo>;
    /**
     * Get window manager directly
     */
    getWindowManager(): WindowManager;
    /**
     * Get i18n instance for translations
     */
    getI18n(): any;
    /**
     * Get translation string
     */
    t(key: string, params?: any, defaultValue?: string): any;
    /**
     * Get lifecycle phase
     */
    getPhase(): "booting" | "ready" | "destroying" | "destroyed";
    /**
     * Check if ready
     */
    isReady(): boolean;
    /**
     * Internal logging
     */
    private log;
}
declare const CM: () => ClientManager | undefined;
declare const getRouter: () => Router | undefined;
declare const back: () => void | undefined;
declare const forward: () => void | undefined;
declare const push: (path: string) => void | undefined;
declare const replace: (path: string) => void | undefined;
declare const getI18n: () => any;
declare const getLang: () => any;
declare const setLang: (lang: string) => any;
declare const t: (key: string, params?: any, defaultValue?: string) => any;
declare const tLang: (lang: string, key: string, params?: any, defaultValue?: string) => any;

declare function start(config: ClientManagerConfig): Promise<ClientManager>;

export { type ActionFunction, CM, ClientManager, type LoaderFunction, type NavigateOptions, NavigationError, type Route, type RouteContext, type RouteMatch, type RouteParams, type RouterConfig, back, forward, getI18n, getLang, getRouter, push, replace, setLang, start, t, tLang };
