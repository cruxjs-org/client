import * as _minejs_i18n from '@minejs/i18n';
import { I18nConfig } from '@minejs/i18n';
export { t } from '@minejs/i18n';
import * as _minejs_browser from '@minejs/browser';
import { Router, EventsManager, WindowManager } from '@minejs/browser';
import * as _minejs_signals from '@minejs/signals';
import { JSXElement } from '@minejs/jsx';

type RouteComponent = () => JSXElement | null;
/**
 * Client-side plugin system
 * Plugins can hook into lifecycle phases to extend functionality
 * (logging, analytics, error handling, etc.)
 */
interface ClientPlugin {
    name: string;
    onBoot?: (context: PluginContext) => void | Promise<void>;
    onReady?: (context: PluginContext) => void | Promise<void>;
    onDestroy?: (context: PluginContext) => void | Promise<void>;
}
/**
 * Context passed to plugin lifecycle hooks
 */
interface PluginContext {
    debug: boolean;
    config: ClientManagerConfig;
}
/**
 * Lifecycle hooks for the client application
 */
interface ClientManagerHooks {
    onBoot?: () => void | Promise<void>;
    onReady?: () => void | Promise<void>;
    onDestroy?: () => void | Promise<void>;
}
/**
 * Client Manager Configuration
 * Declarative configuration pattern mirroring @cruxjs/app AppConfig
 */
interface ClientManagerConfig {
    routes: Record<string, RouteComponent>;
    notFoundComponent?: RouteComponent;
    debug?: boolean;
    lifecycle?: ClientManagerHooks;
    plugins?: ClientPlugin[];
    i18n?: I18nConfig;
}

declare class ClientManager {
    private router;
    private eventsManager;
    private windowManager;
    private lifecycle;
    private config;
    private hooks;
    private plugins;
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
    getI18n(): _minejs_i18n.I18nManager;
    /**
     * Get translation string
     */
    t(key: string, defaultValue?: string): string;
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
/**
 * Get ClientManager instance if available
 */
declare function getGlobalClientManager(): ClientManager | undefined;
declare function start(config: ClientManagerConfig): Promise<ClientManager>;

export { ClientManager, type ClientManagerConfig, type ClientManagerHooks, type ClientPlugin, type PluginContext, type RouteComponent, getGlobalClientManager, start };
