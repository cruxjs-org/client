import { ClientManagerConfig, ClientManagerHooks } from '@cruxjs/base';
export { ClientExtension, ClientManagerConfig, ClientManagerHooks, ExtensionContext, LangConfig, RouteComponent, ThemeConfig } from '@cruxjs/base';
import * as _minejs_browser from '@minejs/browser';
import { Router, EventsManager, WindowManager } from '@minejs/browser';
import * as _minejs_signals from '@minejs/signals';

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

export { CM, ClientManager, back, forward, getI18n, getLang, getRouter, push, replace, setLang, start, t, tLang };
