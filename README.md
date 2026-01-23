<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.3.4-black"/>
    <a href="https://github.com/cruxjs-org"><img src="https://img.shields.io/badge/🔥-@cruxjs-black"/></a>
    <br>
    <img src="https://img.shields.io/badge/coverage-~%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/cruxjs-org/client?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/cruxjs-org/client?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Overview 👀

    - #### Why ?
        > To provide a powerful, declarative client-side application manager with built-in routing, lifecycle management, event handling, and plugin architecture for modern SPAs.

    - #### When ?
        > When you need a structured, production-ready client application with:
        > - Automatic routing and navigation
        > - Component lifecycle management
        > - Event handling utilities
        > - Plugin-based extensibility
        > - i18n integration
        > - Reactive state management

        > When you use [@cruxjs/app](https://github.com/cruxjs-org/app).

    <br>
    <br>

- ## Quick Start 🔥

    > install [`hmm`](https://github.com/minejs-org/hmm) first.

    ```bash
    # in your terminal
    hmm i @cruxjs/client
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

    - #### Setup

        > ***🌟 in: `.\src\app\client.ts`. 🌟***

        > Create your client configuration with routes and lifecycle hooks:

        ```typescript
        import { ClientManagerConfig, start } from '@cruxjs/client';

        const config: ClientManagerConfig = {
            debug               : true,

            routes: {
                '/'             : HomePage,
                '/about'        : AboutPage,
                '/products/:id' : ProductDetailPage,
            },

            notFoundComponent   : NotFoundPage,
            allowedQueryParams? : (string | RegExp)[]

            lifecycle: {
                onBoot          : () => console.log('App booting...'),
                onReady         : () => console.log('App ready!'),
                onDestroy       : () => console.log('Cleaning up...'),
            },

            plugins: [
                // Add your plugins here
            ],
        };

        start(config);
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>
        <br>

    - #### Usage

        > Create your page components using `@minejs/jsx`:

        ```tsx
        import { JSXElement }   from '@minejs/jsx';
        import { t }            from '@minejs/i18n';

        export function HomePage(): JSXElement {
            return (
                <div class="page-container">
                    <h1>{t('home.title')}</h1>
                    <p>{t('home.description')}</p>
                </div>
            );
        }
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

        - #### Routing

            ```typescript
            import { getGlobalClientManager } from '@cruxjs/client';

            // Navigate to a route
            const manager = getGlobalClientManager();
            manager.navigate('/products/123');

            // Create link handlers for <a> tags
            const handleClick = manager.createLinkHandler('/about');
            ```

            ```tsx
            <a href="/about" onclick={handleClick}>About Us</a>
            ```

        - #### Root Layout

            ```typescript
            import { JSXElement } from '@minejs/jsx';

            // Create a root layout that wraps all pages
            function AppLayout(): JSXElement {
                return (
                    <div class="app-wrapper">
                        <header class="app-header">
                            <h1>My App</h1>
                            <nav>{/* navigation */}</nav>
                        </header>
                        <main id="main-overlay"></main>
                        {/* Pages are rendered in #main-overlay */}
                        <footer class="app-footer">
                            <p>© 2026 My App</p>
                        </footer>
                    </div>
                );
            }

            const config: ClientManagerConfig = {
                routes: { /* ... */ },
                rootLayout: AppLayout,  // Optional: wraps all pages
            };
            ```

            > The `rootLayout` is rendered once and pages are mounted inside the element with `#main-overlay` attribute. This allows you to have persistent headers, footers, navigation, and modals that don't remount when routes change.

        - #### Loader kit

            ```typescript
            const manager = getGlobalClientManager();
            manager.showLoader();               // shows 'Loading...'
            manager.showLoader('Saving...');    // update message
            manager.hideLoader();               // hides with fade-out
            ```

        - #### Lifecycle Hooks

            ```typescript
            const config: ClientManagerConfig = {
                routes: { /* ... */ },

                lifecycle: {
                    // Called during BOOT phase - before any rendering
                    onBoot: async () => {
                        console.log('Phase: BOOT');
                        // Initialize services, load data, etc.
                    },

                    // Called during READY phase - after mounting
                    onReady: async () => {
                        console.log('Phase: READY');
                        // App is live and mounted to DOM
                    },

                    // Called during DESTROY phase - on cleanup
                    onDestroy: async () => {
                        console.log('Phase: DESTROY');
                        // Clean up listeners, timers, etc.
                    },
                },
            };
            ```

        - #### Event Binding

            ```typescript
            const manager = getGlobalClientManager();

            // Bind event with cleanup handler
            const unbind = manager.on(
                document,
                'click',
                (e) => console.log('Clicked:', e.target),
                { capture: false }
            );

            // Unbind event
            unbind();

            // Or unbind manually
            manager.off(document, 'click', handler);
            ```

        - #### Plugin System

            ```typescript
            interface ClientPlugin {
                name        : string;
                onBoot?     : (context: PluginContext) => void | Promise<void>;
                onReady?    : (context: PluginContext) => void | Promise<void>;
                onDestroy?  : (context: PluginContext) => void | Promise<void>;
            }

            const analyticsPlugin: ClientPlugin = {
                name        : 'analytics',
                onReady     : async (context) => {
                    console.log('Initialize analytics tracking');
                    // Send page view event, etc.
                },
            };

            const config: ClientManagerConfig = {
                routes      : { /* ... */ },
                plugins     : [analyticsPlugin],
            };
            ```

        - #### i18n Integration

            ```typescript
            // i18n is automatically loaded from server meta tag
            // Access translations anywhere:

            const manager = getGlobalClientManager();

            // Get translation
            const title = manager.t('home.title');

            // Or import directly from @minejs/i18n
            import { t, setLanguage } from '@minejs/i18n';

            t('key') // "Translated value"

            // Change language
            await setLanguage('ar');
            ```

        - #### Viewport & Window Management

            ```typescript
            const manager = getGlobalClientManager();

            // Get viewport as reactive signal
            const viewport = manager.getViewport();

            // Manually access window manager
            const windowManager = manager.getWindowManager();

            // Listen to viewport changes
            effect(() => {
                const vp = viewport();
                console.log('Viewport:', vp.width, vp.height);
            });
            ```

        - #### Router Access

            ```typescript
            const manager = getGlobalClientManager();

            // Get underlying router for advanced usage
            const router = manager.getRouter();

            // Navigate
            router.push('/about');

            // Listen to route changes
            router.afterEach((to) => {
                console.log('Navigated to:', to.path);
            });
            ```

        - #### Lifecycle Phases

            ```typescript
            const manager = getGlobalClientManager();

            // Get current phase: 'booting' | 'ready' | 'destroying' | 'destroyed'
            const phase = manager.getPhase();

            // Check if ready
            if (manager.isReady()) {
                console.log('App is live and mounted');
            }
            ```

    <br>
    <br>

- ## Complete Example with @cruxjs/app 📑

    - ### Server Configuration

        ```typescript
        // src/index.ts
        import { createApp, AppConfig } from '@cruxjs/app';
        import { serverSPA } from '@cruxjs/spa';

        import * as HomePage from './app/ui/pages/home';
        import * as ErrorPage from './app/ui/pages/error';

        const appConfig: AppConfig = {
            debug                   : true,

            server: {
                port                : 3000,
                host                : 'localhost',
            },

            static: {
                path                : '/static',
                directory           : './src/shared/static',
            },

            client: {
                entry               : './src/app/client.ts',
                output              : './src/shared/static/dist/js',
                minify              : true,
            },

            i18n: {
                defaultLanguage     : 'en',
                supportedLanguages  : ['en', 'ar'],
                basePath            : './src/shared/static/dist/i18n'
            },

            style: {
                entry               : './src/app/ui/style/index.scss',
                output              : './src/shared/static/dist/css/min.css',
            },

            plugins                 : []
        };

        // Create SPA plugin
        const spaPlugin = serverSPA({
            baseUrl                 : 'http://localhost:3000',
            clientEntry             : './src/app/client.ts',
            clientScriptPath        : ['/static/dist/js/client.js'],
            clientStylePath         : ['/static/dist/css/min.css'],

            pages                   : [HomePage.meta],
            errorPages              : [ErrorPage.meta],
            autoBootstrapClient     : true
        }, appConfig);

        appConfig.plugins.push(spaPlugin);

        // Create and boot app
        const app = createApp(appConfig);
        app.boot();
        ```

    - ### Page Components

        ```tsx
        // src/app/ui/pages/home.tsx
        import { JSXElement }       from '@minejs/jsx';
        import { SPAPageConfig }    from '@cruxplug/spa';
        import { t }                from '@minejs/i18n';

        export function HomePage(): JSXElement {
            return (
                <div class="page-container">
                    <h1>{t('home.title')}</h1>
                    <p>{t('home.description')}</p>
                </div>
            );
        }

        export const meta: SPAPageConfig = {
            title: 'Home - My App',
            path: '/',
            description: 'Welcome to our application',
        };
        ```

        ```tsx
        // src/app/ui/pages/error.tsx
        import { JSXElement }       from '@minejs/jsx';
        import { SPAPageConfig }    from '@cruxplug/spa';
        import { t }                from '@minejs/i18n';

        export function ErrorPage(): JSXElement {
            return (
                <div class="error-container">
                    <h1>{t('error.title')}</h1>
                    <p>{t('error.description')}</p>
                </div>
            );
        }

        export const meta: SPAPageConfig = {
            title: 'Error - My App',
            path: '/*',
        };
        ```

    - ### Client Configuration

        ```typescript
        // src/app/client.ts
        import { ClientManagerConfig, start } from '@cruxjs/client';
        import { JSXElement } from '@minejs/jsx';

        import { HomePage } from './ui/pages/home';
        import { ErrorPage } from './ui/pages/error';

        // Root layout wraps all pages
        function AppLayout(): JSXElement {
            return (
                <div class="app-container">
                    <header>Header Content</header>
                    <main id="main-overlay"></main>
                    <footer>Footer Content</footer>
                </div>
            );
        }

        const config: ClientManagerConfig = {
            debug               : true,

            routes: {
                '/'             : HomePage,
            },

            notFoundComponent   : ErrorPage,

            rootLayout          : AppLayout,  // Optional: wraps all pages

            lifecycle: {
                onBoot          : () => {
                    console.log('[App] BOOT phase - Initializing');
                },

                onReady         : () => {
                    console.log('[App] READY phase - App is live');
                },

                onDestroy       : () => {
                    console.log('[App] DESTROY phase - Cleaning up');
                },
            },

            plugins: [
                {
                    name        : 'logger',

                    onBoot      : async (context) => {
                        console.log('Logger plugin initialized');
                    },

                    onReady     : async (context) => {
                        console.log('Logger plugin ready');
                    }
                },
            ],
        };

        start(config);
        ```

    - ### Translations

        ```json
        // src/shared/static/dist/i18n/en.json
        {
            "home": {
                "title"         : "Welcome to My App",
                "description"   : "Build amazing web applications with @cruxjs"
            },
            "error": {
                "title"         : "Page Not Found",
                "description"   : "The page you're looking for doesn't exist"
            }
        }
        ```

        ```json
        // src/shared/static/dist/i18n/ar.json
        {
            "home": {
                "title"         : "أهلا وسهلا",
                "description"   : "قم ببناء تطبيقات ويب رائعة مع @cruxjs"
            },
            "error": {
                "title"         : "الصفحة غير موجودة",
                "description"   : "الصفحة التي تبحث عنها غير موجودة"
            }
        }
        ```

    <br>
    <br>

- ## API Reference 📚

    - ### Types

        ```typescript
        type RouteComponent     = () => JSXElement | null;

        interface ClientPlugin {
            name                : string;
            onBoot?             : (context: PluginContext) => void | Promise<void>;
            onReady?            : (context: PluginContext) => void | Promise<void>;
            onDestroy?          : (context: PluginContext) => void | Promise<void>;
        }

        interface PluginContext {
            debug               : boolean;
            config              : ClientManagerConfig;
        }

        interface ClientManagerHooks {
            onBoot?             : () => void | Promise<void>;
            onReady?            : () => void | Promise<void>;
            onDestroy?          : () => void | Promise<void>;
        }

        interface ClientManagerConfig {
            routes              : Record<string, RouteComponent>;
            notFoundComponent?  : RouteComponent;
            rootLayout?         : () => JSXElement | null;
            debug?              : boolean;
            lifecycle?          : ClientManagerHooks;
            plugins?            : ClientPlugin[];
            i18n?               : I18nConfig;
        }
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

    - ### ClientManager Methods

        - #### `boot()`

            > Initialize the application - Phase 1
            > Calls all plugin `onBoot` hooks

            ```typescript
            await manager.boot();
            ```

        - #### `ready()`

            > Mount the application to DOM - Phase 2
            > Calls all plugin `onReady` hooks
            > Sets up routing and reactive effects

            ```typescript
            await manager.ready();
            ```

        - #### `destroy()`

            > Shutdown the application - Phase 3
            > Calls all plugin `onDestroy` hooks
            > Cleans up listeners and timers

            ```typescript
            await manager.destroy();
            ```

        - #### `navigate(path)`

            > Navigate to a route

            ```typescript
            manager.navigate('/about');
            manager.navigate('/products/123');
            ```

        - #### `mount(selector)`

            > Mount router to DOM element with optional root layout
            > Sets up reactive routing, mounts root layout if provided, and initial render
            > Pages render inside `#main-overlay` if rootLayout exists, otherwise in the selector

            ```typescript
            manager.mount('body');
            manager.mount(document.getElementById('app'));
            ```

        - #### `on(event, callback)` - Lifecycle

            > Bind lifecycle hook

            ```typescript
            manager.on('onBoot', () => {
                console.log('Booting...');
            });
            ```

        - #### `on(target, event, handler, options)` - Event Binding

            > Bind DOM event with auto-cleanup

            ```typescript
            const unbind = manager.on(
                document,
                'click',
                (e) => console.log(e),
                { capture: false }
            );

            unbind(); // Remove listener
            ```

        - #### `off(target, event, handler)`

            > Unbind DOM event

            ```typescript
            manager.off(document, 'click', handler);
            ```

        - #### `getCurrentPath()`

            > Get current route path as reactive signal

            ```typescript
            const path = manager.getCurrentPath();

            effect(() => {
                console.log('Current path:', path());
            });
            ```

        - #### `createLinkHandler(path)`

            > Create click handler for navigation links

            ```typescript
            const handleClick = manager.createLinkHandler('/about');
            ```

            ```tsx
            <a href="/about" onclick={handleClick}>About</a>
            ```

        - #### `getRouter()`

            > Get underlying router for advanced usage

            ```typescript
            const router = manager.getRouter();
            router.push('/products');
            router.afterEach((to) => {
                document.title = to.path;
            });
            ```

        - #### `getEventsManager()`

            > Get events manager directly

            ```typescript
            const events = manager.getEventsManager();
            ```

        - #### `getWindowManager()`

            > Get window manager for viewport tracking

            ```typescript
            const windowManager = manager.getWindowManager();
            ```

        - #### `getViewport()`

            > Get viewport dimensions as reactive signal

            ```typescript
            const viewport = manager.getViewport();

            effect(() => {
                const vp = viewport();
                console.log(`${vp.width}x${vp.height}`);
            });
            ```

        - #### `getI18n()`

            > Get i18n instance

            ```typescript
            const i18n = manager.getI18n();
            ```

        - #### `t(key, defaultValue?)`

            > Translate a key

            ```typescript
            const title = manager.t('home.title', 'Default Title');
            ```

        - #### `getPhase()`

            > Get current lifecycle phase

            ```typescript
            const phase = manager.getPhase();
            // 'booting' | 'ready' | 'destroying' | 'destroyed'
            ```

        - #### `isReady()`

            > Check if app is ready

            ```typescript
            if (manager.isReady()) {
                console.log('App is mounted and live');
            }
            ```

    - ### Global Functions

        - #### `start(config)`

            > Create and boot ClientManager with config
            > Automatically reads i18n from HTML meta tag
            > Calls boot() and ready() phases

            ```typescript
            const manager = await start({
                routes              : { '/': HomePage },
                notFoundComponent   : ErrorPage,
                lifecycle           : { /* ... */ }
            });
            ```

        - #### `getGlobalClientManager()`

            > Get singleton ClientManager instance

            ```typescript
            const manager = getGlobalClientManager();
            if (manager?.isReady()) {
                manager.navigate('/');
            }
            ```

    <br>
    <br>

- ## Lifecycle Flow 🔄

    ```
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │  start(config)                                          │
    │  ├─ Read i18n from meta tag                             │
    │  ├─ Create ClientManager                                │
    │  └─ Call boot()                                         │
    │                                                         │
    ├─ BOOT Phase                                             │
    │  ├─ Run plugin.onBoot()                                 │
    │  ├─ Run config.lifecycle.onBoot()                       │
    │  └─ Initialize services                                 │
    │                                                         │
    ├─ READY Phase                                            │
    │  ├─ Mount router to DOM                                 │
    │  ├─ Setup reactive routing                              │
    │  ├─ Run plugin.onReady()                                │
    │  ├─ Run config.lifecycle.onReady()                      │
    │  └─ Render initial component                            │
    │                                                         │
    ├─ ... User navigates between routes ...                  │
    │                                                         │
    ├─ beforeunload Event (page leaving)                      │
    │  └─ Call destroy()                                      │
    │                                                         │
    └─ DESTROY Phase                                          │
       ├─ Run plugin.onDestroy()                              │
       ├─ Run config.lifecycle.onDestroy()                    │
       ├─ Cleanup listeners                                   │
       └─ Set lifecycle to 'destroyed'                        │
    ```

    <br>
    <br>

- ## Best Practices ✨

    - #### Configuration

        ```typescript
        // ✅ DO: Use declarative config
        const config: ClientManagerConfig = {
            routes: {
                '/': HomePage,
                '/about': AboutPage,
            },
            lifecycle: {
                onBoot: () => { /* ... */ },
                onReady: () => { /* ... */ },
            }
        };

        // ❌ DON'T: Imperative setup
        const manager = new ClientManager({});
        manager.boot();
        manager.ready();
        ```

    - #### Route Components

        ```typescript
        // ✅ DO: Return JSX from components
        export function MyPage(): JSXElement {
            return (
                <div>
                    <h1>{t('page.title')}</h1>
                </div>
            );
        }

        // ❌ DON'T: Return HTML strings
        export function MyPage(): string {
            return '<h1>My Page</h1>';
        }
        ```

    - #### Event Binding

        ```typescript
        // ✅ DO: Use event manager with cleanup
        const unbind = manager.on(button, 'click', handler);
        // Auto-cleanup on component destroy

        // ❌ DON'T: Direct addEventListener
        button.addEventListener('click', handler);
        // Manual cleanup required
        ```

    - #### Root Layout

        ```typescript
        // ✅ DO: Use root layout for persistent UI
        function AppLayout(): JSXElement {
            return (
                <div>
                    <header>Persistent Header</header>
                    <main id="main-overlay"></main>
                    <footer>Persistent Footer</footer>
                </div>
            );
        }

        const config = {
            routes: { /* ... */ },
            rootLayout: AppLayout,  // Pages render inside #main-overlay
        };

        // ❌ DON'T: Create layout inside each page
        export function HomePage(): JSXElement {
            return (
                <div>
                    <header>Recreated on every navigation</header>
                    <div>Page content</div>
                </div>
            );
        }
        ```

    - #### Navigation

        ```typescript
        // ✅ DO: Use manager.navigate()
        manager.navigate('/products/123');

        // ✅ DO: Use link handler
        <a href="/about" onclick={manager.createLinkHandler('/about')}>

        // ❌ DON'T: Direct window.location
        window.location.href = '/about';
        ```

    - #### Lifecycle Hooks

        ```typescript
        // ✅ DO: Use for initialization
        lifecycle: {
            onBoot: async () => {
                await loadConfig();
                await initializeServices();
            }
        }

        // ❌ DON'T: Block with heavy work
        lifecycle: {
            onBoot: () => {
                // Very heavy sync operation here
            }
        }
        ```

    - #### Plugin Architecture

        ```typescript
        // ✅ DO: Extend with plugins
        const analyticsPlugin: ClientPlugin = {
            name: 'analytics',
            onReady: () => { trackPageView(); }
        };

        // ❌ DON'T: Modify app core
        manager.customProperty = ...;
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>
<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
