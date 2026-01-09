<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="80" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.4-black"/>
    <img src="https://img.shields.io/badge/🔥-@cruxjs-black"/>
    <br>
    <img src="https://img.shields.io/badge/coverage----%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/cruxjs-org/client?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/cruxjs-org/client?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > **_Pure management layer for client-side applications. Routing, lifecycle, events, and viewport management without dictating your architecture._**

    - ### Setup

        > install [`hmm`](https://github.com/minejs-org/hmm) first.

        ```bash
        hmm i @cruxjs/client
        ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Usage

        ```ts
        import { ClientManager } from '@cruxjs/client';
        import type { ClientManagerConfig } from '@cruxjs/client';
        ```

        - ### 1. Basic Setup

            > Create your page components:

            ```typescript
            import { ClientManager } from '@cruxjs/client';

            // Your components (you build these)
            const HomePage = () => <div>Welcome Home</div>;
            const AboutPage = () => <div>About Us</div>;
            const NotFoundPage = () => <div>404 - Not Found</div>;

            // Create manager with YOUR routes
            const app = new ClientManager({
                routes: {
                    '/': HomePage,
                    '/about': AboutPage
                },
                notFoundComponent: NotFoundPage,
                debug: true
            });

            // Boot and ready
            await app.boot();
            await app.ready('#app');

            // App is live and routing is reactive
            ```

        - ### 1.5 With Internationalization (i18n)

            > Setup multi-language support with translations:

            ```typescript
            import { ClientManager } from '@cruxjs/client';

            const HomePage = () => <div>Welcome Home</div>;
            const NotFoundPage = () => <div>404 - Not Found</div>;

            // Create manager with i18n config
            const app = new ClientManager({
                routes: {
                    '/': HomePage
                },
                notFoundComponent: NotFoundPage,
                i18n: {
                    defaultLanguage: 'en',
                    supportedLanguages: ['en', 'ar'],
                    // TODO: short it
                    basePath: 'http://localhost:3000/static/dist/i18n'  // Path to translation files
                },
                debug: true
            });

            // Boot and ready
            await app.boot();
            await app.ready('#app');

            // Now use translations in components or hooks
            const { t } = app.getI18n();
            console.log(t('welcome')); // Gets translation key
            ```

        - ### 2. With Lifecycle Hooks

            ```typescript
            const app = new ClientManager({
                routes: {
                    '/': HomePage,
                    '/about': AboutPage
                },
                notFoundComponent: NotFoundPage,
                debug: true
            });

            // Setup hooks before booting
            app.on('onBoot', async () => {
                console.log('App is booting...');
                // Load data, initialize services, etc.
            });

            app.on('onReady', async () => {
                console.log('App is live!');
                // Track page views, setup analytics
            });

            app.on('onDestroy', async () => {
                console.log('Cleaning up...');
                // Close connections, cancel requests
            });

            // Start lifecycle
            await app.boot();
            await app.ready('#app');

            // Later, shutdown
            await app.destroy();
            ```

        - ### 3. With Event Binding

            ```typescript
            const app = new ClientManager({
                routes: { '/': HomePage },
                notFoundComponent: NotFoundPage
            });

            // Bind events globally
            const unsubscribe = app.on(
                document,
                'click',
                (event) => console.log('Document clicked', event)
            );

            // Or bind to specific elements
            app.on(
                document.getElementById('myButton'),
                'click',
                () => alert('Button clicked')
            );

            // Unsubscribe when needed
            unsubscribe();
            ```

        - ### 4. With Navigation

            ```typescript
            const app = new ClientManager({
                routes: {
                    '/': HomePage,
                    '/about': AboutPage,
                    '/contact': ContactPage
                },
                notFoundComponent: NotFoundPage
            });

            await app.boot();
            await app.ready('#app');

            // Navigate programmatically
            app.navigate('/about');

            // Get current path as reactive signal
            const currentPath = app.getCurrentPath();
            console.log(currentPath()); // '/about'

            // Create link handlers for anchor tags
            const handleHomeClick = app.createLinkHandler('/');
            ```

        - ### 5. With Viewport Reactivity

            ```typescript
            const app = new ClientManager({
                routes: { '/': HomePage },
                notFoundComponent: NotFoundPage
            });

            await app.boot();
            await app.ready('#app');

            // Get viewport as reactive signal
            const viewport = app.getViewport();

            // Subscribe to viewport changes
            import { effect } from '@minejs/signals';

            effect(() => {
                const { width, height } = viewport();
                console.log(`Viewport: ${width}x${height}`);
            });
            ```

    <br>

- ## API Reference 🔥

    ### Core Class

    - #### `ClientManager`
        > Main class for orchestrating client-side routing, lifecycle, and events

        ```typescript
        new ClientManager(config: ClientManagerConfig)
        ```

        **Configuration:**
        ```typescript
        interface ClientManagerConfig {
            // Required: Your page components
            routes: Record<string, RouteComponent>

            // Optional: 404 fallback component
            notFoundComponent?: RouteComponent

            // Optional: Enable debug logging
            debug?: boolean
        }

        type RouteComponent = () => JSXElement | null;
        ```

    ### Lifecycle Methods

    - #### `boot(): Promise<void>`
        > Phase 1: Bootstrap the application
        > - Calls `onBoot` hook if defined
        > - Sets lifecycle to 'booting'

        ```typescript
        await app.boot();
        ```

    - #### `ready(mountSelector: string | HTMLElement): Promise<void>`
        > Phase 2: Mount and activate the application
        > - Mounts router to DOM
        > - Calls `onReady` hook if defined
        > - Sets lifecycle to 'ready'
        > - Enables reactive routing

        ```typescript
        await app.ready('#app');
        // or
        await app.ready(document.getElementById('app'));
        ```

    - #### `destroy(): Promise<void>`
        > Phase 3: Shutdown and cleanup
        > - Calls `onDestroy` hook if defined
        > - Cleans up managers
        > - Sets lifecycle to 'destroyed'

        ```typescript
        await app.destroy();
        ```

    ### Lifecycle Hooks

    - #### `on(event: 'onBoot' | 'onReady' | 'onDestroy', callback): this`
        > Register lifecycle hooks

        ```typescript
        app.on('onBoot', async () => {
            // Initialize services, load data
        });

        app.on('onReady', async () => {
            // Track page views, start animations
        });

        app.on('onDestroy', async () => {
            // Cleanup connections
        });
        ```

    ### Event Binding

    - #### `on(target, event, handler, options?): () => void`
        > Bind events to DOM elements with automatic cleanup

        ```typescript
        const unsubscribe = app.on(
            document.getElementById('button'),
            'click',
            (event) => console.log('Clicked'),
            { once: true }
        );

        // Unsubscribe when needed
        unsubscribe();
        ```

    - #### `off(target, event, handler): void`
        > Unbind events

        ```typescript
        app.off(element, 'click', myHandler);
        ```

    ### Routing & Navigation

    - #### `navigate(path: string): void`
        > Navigate to a route
        > - Updates the router
        > - Triggers reactive re-render
        > - Updates current path signal

        ```typescript
        app.navigate('/about');
        ```

    - #### `mount(selector: string | HTMLElement): void`
        > Mount router to DOM element
        > - Called automatically by `ready()`
        > - Sets up reactive routing effect
        > - Handles component rendering

        ```typescript
        app.mount('#app');
        ```

    - #### `getCurrentPath(): Signal<string>`
        > Get current path as reactive signal

        ```typescript
        const pathSignal = app.getCurrentPath();

        import { effect } from '@minejs/signals';
        effect(() => {
            console.log(`Current path: ${pathSignal()}`);
        });
        ```

    - #### `createLinkHandler(path: string): (e: MouseEvent) => void`
        > Create a navigation handler for links

        ```typescript
        const goHome = app.createLinkHandler('/');

        // Use in template/JSX
        <a href="/" onClick={goHome}>Home</a>
        ```

    - #### `getRouter(): Router`
        > Access the underlying router for advanced usage

        ```typescript
        const router = app.getRouter();
        // Use @minejs/browser Router API
        ```

    ### Manager Access

    - #### `getEventsManager(): EventsManager`
        > Access the events manager directly

        ```typescript
        const events = app.getEventsManager();
        ```

    - #### `getWindowManager(): WindowManager`
        > Access the window/viewport manager directly

        ```typescript
        const window = app.getWindowManager();
        ```

    - #### `getViewport(): Signal<ViewportInfo>`
        > Get viewport dimensions as reactive signal

        ```typescript
        const viewport = app.getViewport();

        effect(() => {
            const { width, height, isMobile } = viewport();
            console.log(`Size: ${width}x${height}, Mobile: ${isMobile}`);
        });
        ```

    ### State Inspection

    - #### `getPhase(): 'booting' | 'ready' | 'destroying' | 'destroyed'`
        > Get current lifecycle phase

        ```typescript
        const phase = app.getPhase();
        if (phase === 'ready') {
            // App is live
        }
        ```

    - #### `isReady(): boolean`
        > Check if app is in ready phase

        ```typescript
        if (app.isReady()) {
            // Safe to use all features
        }
        ```

    ### Internationalization (i18n)

    - #### `getI18n(): I18nInstance`
        > Access the i18n instance for translations
        > - Returns `undefined` if i18n not initialized
        > - Call after `boot()` if i18n config provided

        ```typescript
        const i18n = app.getI18n();
        if (i18n) {
            const greeting = i18n.t('greeting');
            console.log(greeting);
        }
        ```

    - #### `getTranslation(key: string, defaultValue?: string): string`
        > Safely get a translation with fallback
        > - Returns default value if key not found
        > - Returns key if i18n not initialized
        > - Safe to call anytime

        ```typescript
        // In lifecycle hook or component
        const message = app.getTranslation('welcome', 'Welcome!');
        console.log(message); // 'Welcome!' if not found in i18n
        ```

    ### i18n Utilities

    - #### `useTranslation(): { t: (key: string, defaultValue?: string) => string }`
        > Composable hook to use translations in components
        > - Safe even if i18n not initialized
        > - Returns both `t()` and `getTranslation()` methods

        ```typescript
        import { useTranslation } from '@cruxjs/client';

        // In your components
        const { t } = useTranslation();

        const HomePage = () => {
            return <div>{t('home.title', 'Welcome')}</div>;
        };
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->