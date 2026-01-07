import * as _minejs_browser from '@minejs/browser';
import { Router, EventsManager, WindowManager } from '@minejs/browser';
import * as _minejs_signals from '@minejs/signals';
import { JSXElement } from '@minejsx/render';

type RouteComponent = () => JSXElement | null;
interface ClientManagerConfig {
    routes: Record<string, RouteComponent>;
    notFoundComponent?: RouteComponent;
    debug?: boolean;
}
interface ClientManagerHooks {
    onBoot?: () => void | Promise<void>;
    onReady?: () => void | Promise<void>;
    onDestroy?: () => void | Promise<void>;
}

declare class ClientManager {
    private router;
    private eventsManager;
    private windowManager;
    private lifecycle;
    private config;
    private hooks;
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
     */
    ready(mountSelector: string | HTMLElement): Promise<void>;
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

export { ClientManager };
