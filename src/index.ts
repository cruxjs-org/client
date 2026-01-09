/* eslint-disable @typescript-eslint/no-explicit-any */
// src/index.ts
//
// Made with ❤️ by Maysara.


// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { signal, effect } from '@minejs/signals';
    import { I18nConfig, setupAuto, getI18n } from '@minejs/i18n';
    import { EventsManager, Router, WindowManager, createRouter } from '@minejs/browser';
    import * as types from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class ClientManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private router              : Router;
            private eventsManager       : EventsManager;
            private windowManager       : WindowManager;
            private lifecycle           : 'booting' | 'ready' | 'destroying' | 'destroyed' = 'booting';
            private config              : types.ClientManagerConfig;
            private hooks               : types.ClientManagerHooks = {};
            private debug               : boolean;
            private routeComponents     : Record<string, types.RouteComponent> = {};
            private currentPathSignal   = signal<string>(window.location.pathname ?? '/');

            constructor(config: types.ClientManagerConfig) {
                this.config = config;
                this.debug = config.debug ?? false;

                this.log('[INIT] Creating ClientManager');

                // Store route components provided by user
                this.routeComponents = config.routes;

                // Initialize managers from @minejs/browser
                this.eventsManager = new EventsManager();
                this.windowManager = new WindowManager();

                // Initialize router with user-provided routes
                const routesArray = Object.entries(config.routes).map(([path, component]) => ({
                    path,
                    component
                }));

                this.router = createRouter({
                    routes: routesArray,
                    notFoundComponent: config.notFoundComponent,
                });

                // Connect router changes to signal for automatic re-rendering
                this.router.afterEach((to) => {
                    this.currentPathSignal.set(to.path);
                });

                // Make clientManager globally available
                (globalThis as any).__CLIENT_MANAGER__ = this;

                this.log('[INIT] ClientManager created');
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Setup lifecycle hooks OR bind events
             * Overloaded: on(event: 'onBoot'|'onReady'|'onDestroy', callback) - lifecycle
             *             on(target, event, handler) - event binding
             */
            on(event: keyof types.ClientManagerHooks, callback: any): this;
            on<K extends keyof HTMLElementEventMap>(
                target: EventTarget,
                event: K | string,
                handler: EventListener,
                options?: AddEventListenerOptions
            ): () => void;
            on(
                eventOrTarget: keyof types.ClientManagerHooks | EventTarget,
                callbackOrEvent?: any,
                handler?: EventListener,
                options?: AddEventListenerOptions
            ): this | (() => void) {
                // Check if this is a lifecycle hook call
                if (typeof eventOrTarget === 'string' && eventOrTarget.startsWith('on')) {
                    this.hooks[eventOrTarget as keyof types.ClientManagerHooks] = callbackOrEvent;
                    return this;
                }

                // Otherwise it's an event binding
                return this.eventsManager.on(
                    eventOrTarget as EventTarget,
                    callbackOrEvent as string,
                    handler as EventListener,
                    options
                );
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Bootstrap the app - Phase 1: BOOT
             */
            async boot(): Promise<void> {
                if (this.lifecycle !== 'booting') {
                    console.warn('[ClientManager] Already booted or destroyed');
                    return;
                }

                this.log('⚡ Phase: BOOT');

                try {
                    // Setup i18n
                    if (this.config.i18n)
                    await this.setupI18n(this.config.i18n!);

                    // Call user onBoot hook
                    if (this.hooks.onBoot) {
                        this.log('→ Calling onBoot hook');
                        await this.hooks.onBoot();
                    }

                    this.log('✓ BOOT phase complete');
                } catch (err) {
                    console.error('[ClientManager] Boot failed:', err);
                    throw err;
                }
            }

            /**
             * Ready the app - Phase 2: READY
             * Mount to DOM and make everything live
             */
            async ready(mountSelector: string | HTMLElement): Promise<void> {
                if (this.lifecycle !== 'booting') {
                    console.warn('[ClientManager] Cannot ready - not in booting phase');
                    return;
                }

                this.log('⚡ Phase: READY');

                try {
                    // Mount router
                    this.mount(mountSelector);
                    this.log('→ Router mounted');

                    // Setup global access for debugging
                    if (this.debug) {
                        (globalThis as any).__CLIENT_MANAGER__ = this;
                        this.log('→ ClientManager available globally');
                    }

                    // Call user onReady hook
                    if (this.hooks.onReady) {
                        this.log('→ Calling onReady hook');
                        await this.hooks.onReady();
                    }

                    this.lifecycle = 'ready';
                    this.log('✓ READY phase complete');
                    this.log('✓ App is ready!');
                } catch (err) {
                    console.error('[ClientManager] Ready failed:', err);
                    throw err;
                }
            }

            /**
             * Shutdown the app - Phase 3: DESTROY
             */
            async destroy(): Promise<void> {
                if (this.lifecycle === 'destroyed') {
                    console.warn('[ClientManager] Already destroyed');
                    return;
                }

                this.lifecycle = 'destroying';
                this.log('⚡ Phase: DESTROY');

                try {
                    // Call user onDestroy hook
                    if (this.hooks.onDestroy) {
                        this.log('→ Calling onDestroy hook');
                        await this.hooks.onDestroy();
                    }

                    // Cleanup managers
                    this.eventsManager.destroy();
                    this.windowManager.destroy();

                    this.lifecycle = 'destroyed';
                    this.log('✓ DESTROY phase complete');
                } catch (err) {
                    console.error('[ClientManager] Destroy failed:', err);
                    throw err;
                }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Initializes internationalization (i18n) support
             *
             * Loads language files and configures the i18n system based on:
             * - Default language
             * - Supported languages
             * - Base path for translation files
             * - File extension (json, cjson, etc.)
             *
             * @param {AppConfig} config - Application configuration with i18n settings
             * @param {Logger} logger - Logger instance for logging setup progress
             * @returns {Promise<void>}
             * @throws {Error} If i18n setup or language file loading fails
             *
             * @example
             * await setupI18n({
             *   i18n: {
             *     defaultLanguage: 'en',
             *     supportedLanguages: ['en', 'ar'],
             *     basePath: './src/i18n'
             *   }
             * }, logger);
             */
             async setupI18n(config: I18nConfig) {
                this.log('Setting up i18n...');

                try {
                    await setupAuto({
                        defaultLanguage: config.defaultLanguage,
                        supportedLanguages: config.supportedLanguages,
                        basePath: config.basePath!,
                        fileExtension: config.fileExtension || 'json'
                    });

                    this.log(`i18n ready → ${config.supportedLanguages!.join(', ')}`);
                } catch (err) {
                    this.log('Failed to setup i18n' + (err as Error).message);
                    throw err;
                }
            }

            /**
             * Navigate to path
             */
            navigate(path: string): void {
                this.router.push(path);
            }

            /**
             * Mount router to DOM element and setup reactive routing
             * Automatically re-renders when route changes
             */
            mount(selector: string | HTMLElement): void {
                const container = typeof selector === 'string'
                    ? document.querySelector(selector)
                    : selector;

                if (!container) {
                    console.warn('[ClientManager] Mount target not found:', selector);
                    return;
                }

                // Setup reactive routing effect - re-renders when currentPathSignal changes
                effect(() => {
                    const currentPath = this.currentPathSignal();
                    const Component = this.routeComponents[currentPath]
                        || this.config.notFoundComponent
                        || null;

                    // Clear and mount new component
                    container.innerHTML = '';

                    if (Component) {
                        const node = Component();
                        if (node instanceof Node) {
                            container.appendChild(node);
                        }
                    } else {
                        container.innerHTML = '<p>No component found for this route</p>';
                    }

                    this.log(`→ Route changed to: ${currentPath}`);
                });

                this.log('→ Routing setup complete');
            }

            /**
             * Get current path signal for reactivity
             */
            getCurrentPath() {
                return this.currentPathSignal;
            }

            /**
             * Create navigation link handler
             */
            createLinkHandler(path: string) {
                return (e: MouseEvent) => {
                    e.preventDefault();
                    this.navigate(path);
                };
            }

            /**
             * Get underlying router for advanced usage
             */
            getRouter() {
                return this.router;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Unbind event
             */
            off(target: EventTarget, event: string, handler: EventListener): void {
                this.eventsManager.off(target, event, handler);
            }

            /**
             * Get events manager directly
             */
            getEventsManager(): EventsManager {
                return this.eventsManager;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Get viewport info as reactive signal
             */
            getViewport() {
                return this.windowManager.getViewport();
            }

            /**
             * Get window manager directly
             */
            getWindowManager(): WindowManager {
                return this.windowManager;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Get i18n instance for translations
             */
            getI18n() {
                return getI18n();
            }

            /**
             * Get translation string
             */
            t(key: string, defaultValue?: string) {
                const i18n = getI18n();
                if (!i18n) {
                    console.warn('[ClientManager] i18n not initialized. Using default value or key.');
                    return defaultValue ?? key;
                }
                return i18n.t(key) ?? defaultValue ?? key;
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── ──── ──────────────────────────────┐

            /**
             * Get lifecycle phase
             */
            getPhase() {
                return this.lifecycle;
            }

            /**
             * Check if ready
             */
            isReady(): boolean {
                return this.lifecycle === 'ready';
            }

            /**
             * Internal logging
             */
            private log(message: string): void {
                if (this.debug) {
                    console.log(`[ClientManager] ${message}`);
                }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝


// ╔════════════════════════════════════════ UTILS ═════════════════════════════════════════╗

    /**
     * Helper to safely get translation
     * Use this in components to access translations
     */
    export function t(key: string, defaultValue?: string) {
        const clientManager = getGlobalClientManager();
        if (!clientManager) {
            console.warn('[ClientManager] Not initialized. Using default value or key.');
            return defaultValue ?? key;
        }
        return clientManager.t(key, defaultValue);
    }

    /**
     * Get global ClientManager instance if available
     */
    export function getGlobalClientManager(): ClientManager | undefined {
        return (globalThis as any).__CLIENT_MANAGER__ as ClientManager | undefined;
    }



// ╚══════════════════════════════════════════════════════════════════════════════════════╝
