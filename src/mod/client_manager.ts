/* eslint-disable @typescript-eslint/no-explicit-any */
// src/mpd/client_manager.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import * as types                   from '../types';
    import { signal, effect  }          from '@minejs/signals';
    import { mount as mountJSX  }       from '@minejs/jsx';
    import { EventsManager, Router, WindowManager, createRouter } from '@minejs/browser';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    let globalClientManagerInstance: ClientManager | undefined;

    export class ClientManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private router              : Router;
            private eventsManager       : EventsManager;
            private windowManager       : WindowManager;
            private lifecycle           : 'booting' | 'ready' | 'destroying' | 'destroyed' = 'booting';
            private config              : types.ClientManagerConfig;
            private hooks               : types.ClientManagerHooks = {};
            private extensions          : types.ClientExtension[] = [];
            private debug               : boolean;
            private routeComponents     : Record<string, types.RouteComponent> = {};
            private currentPathSignal   = signal<string>(window.location.pathname ?? '/');

            constructor(config: types.ClientManagerConfig) {
                this.config = config;
                this.debug = config.debug ?? false;

                this.log('[INIT] Creating ClientManager');

                // Merge lifecycle hooks from config
                if (config.lifecycle) {
                    this.hooks = { ...config.lifecycle };
                }

                // Store extensions from config
                this.extensions = config.extensions ?? [];

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
                    allowedQueryParams: config.allowedQueryParams
                });

                // Connect router changes to signal for automatic re-rendering
                this.router.afterEach((to) => {
                    this.currentPathSignal.set(to.path);
                });

                // Store clientManager instance
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                globalClientManagerInstance = this;

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
                    // Call extensions onBoot hooks
                    for (const extension of this.extensions) {
                        if (extension.onBoot) {
                            this.log(`→ Extension onBoot: ${extension.name}`);
                            await extension.onBoot({
                                debug: this.debug,
                                config: {},
                                cconfig: this.config
                            });
                        }
                    }

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
             *
             * Root selector is always 'body'.
             */
            async ready(): Promise<void> {
                if (this.lifecycle !== 'booting') {
                    console.warn('[ClientManager] Cannot ready - not in booting phase');
                    return;
                }

                this.log('⚡ Phase: READY');

                try {
                    const selector = 'body';

                    // Set body id to 'root' for mounting
                    (document.querySelector(selector) as HTMLElement).id = 'root';

                    // Mount router
                    this.mount(selector);

                    this.log('→ Router mounted');

                    // Call extensions onReady hooks
                    for (const extension of this.extensions) {
                        if (extension.onReady) {
                            this.log(`→ Extension onReady: ${extension.name}`);
                            await extension.onReady({
                                debug: this.debug,
                                config: {},
                                cconfig: this.config
                            });
                        }
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
                    // Call extensions onDestroy hooks (in reverse order)
                    for (let i = this.extensions.length - 1; i >= 0; i--) {
                        const extension = this.extensions[i];
                        if (extension.onDestroy) {
                            this.log(`→ Extension onDestroy: ${extension.name}`);
                            await extension.onDestroy({
                                debug: this.debug,
                                config: {},
                                cconfig: this.config
                            });
                        }
                    }

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
             * Navigate to path
             */
            navigate(path: string): void {
                this.router.push(path);
            }

            /**
             * Mount router to DOM element and setup reactive routing
             * Automatically re-renders when route changes
             * If rootLayout is provided, it wraps all pages
             */
            mount(selector: string | HTMLElement): void {
                const container = typeof selector === 'string'
                    ? (document.querySelector(selector) as HTMLElement)
                    : selector;

                if (!container) {
                    console.warn('[ClientManager] Mount target not found:', selector);
                    return;
                }

                let pageContainer = container;

                // If rootLayout is provided, mount it first (only once)
                if (this.config.rootLayout) {
                    try {
                        const layoutJsx = this.config.rootLayout();
                        if (layoutJsx) {
                            mountJSX(layoutJsx, container);
                            this.log('→ Root layout mounted');

                            // Find the page slot for rendering pages
                            const pageSlot = container.querySelector('#main-overlay');
                            if (pageSlot) {
                                pageContainer = pageSlot as HTMLElement;
                            } else {
                                console.warn('[ClientManager] Page slot #main-overlay not found in root layout. Pages will render to the root container.');
                            }
                        }
                    } catch (err) {
                        console.error('[ClientManager] Error rendering root layout:', err);
                        container.innerHTML = '<p>Error loading root layout</p>';
                        return;
                    }
                }

                // Setup reactive routing effect - re-renders when currentPathSignal changes
                effect(() => {
                    const currentPath = this.currentPathSignal();
                    const Component = this.routeComponents[currentPath]
                        || this.config.notFoundComponent
                        || null;

                    // Clear only the page container (not the entire root if layout exists)
                    pageContainer.innerHTML = '';

                    if (Component) {
                        try {
                            const jsx = Component();
                            // Use @minejs/jsx mount function to properly render JSX
                            if (jsx) {
                                mountJSX(jsx, pageContainer);
                            }
                        } catch (err) {
                            console.error('[ClientManager] Error rendering component:', currentPath, err);
                            pageContainer.innerHTML = '<p>Error loading component</p>';
                        }
                    } else {
                        pageContainer.innerHTML = '<p>No component found for this route</p>';
                    }

                    this.log(`→ Route changed to: ${currentPath}`);
                });

                // Trigger initial render by pushing the current path
                this.router.push(this.currentPathSignal());
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
                return (window as any).__i18n;
            }

            /**
             * Get translation string
             */
            t(key: string, params?: any, defaultValue?: string) {
                if (!(window as any).__i18n) {
                    console.warn('[ClientManager] i18n not initialized. Using default value or key.');
                    return defaultValue ?? key;
                }
                return (window as any).__i18n.t(key, params) ?? defaultValue ?? key;
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



// ╔════════════════════════════════════════ ════ ════════════════════════════════════════╗

    // Quick access
    export const CM         = (): ClientManager | undefined => globalClientManagerInstance;

    // Router
    export const getRouter  = ()                => CM()?.getRouter();
    export const back       = ()                => getRouter()?.back();
    export const forward    = ()                => getRouter()?.forward();
    export const push       = (path: string)    => getRouter()?.push(path);
    export const replace    = (path: string)    => getRouter()?.replace(path);

    // i18n
    export const getI18n    = ()                => CM()?.getI18n();
    export const getLang    = ()                => getI18n()?.getLanguage();
    export const setLang    = (lang: string)    => getI18n()?.setLanguage(lang);
    export const t          = (key: string, params?: any, defaultValue?: string) => CM()?.t(key, params, defaultValue);
    export const tLang      = (lang: string, key: string, params?: any, defaultValue?: string) => getI18n()?.tLang(lang, key, params, defaultValue) ?? (defaultValue ?? key);

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
