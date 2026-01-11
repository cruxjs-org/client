// src/types.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { I18nConfig } from '@minejs/i18n';
    import { JSXElement } from '@minejs/jsx';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type RouteComponent = () => JSXElement | null;

    /**
     * Client-side plugin system
     * Plugins can hook into lifecycle phases to extend functionality
     * (logging, analytics, error handling, etc.)
     */
    export interface ClientPlugin {
        name: string;
        onBoot?: (context: PluginContext) => void | Promise<void>;
        onReady?: (context: PluginContext) => void | Promise<void>;
        onDestroy?: (context: PluginContext) => void | Promise<void>;
    }

    /**
     * Context passed to plugin lifecycle hooks
     */
    export interface PluginContext {
        debug: boolean;
        config: ClientManagerConfig;
    }

    /**
     * Lifecycle hooks for the client application
     */
    export interface ClientManagerHooks {
        onBoot?: () => void | Promise<void>;
        onReady?: () => void | Promise<void>;
        onDestroy?: () => void | Promise<void>;
    }

    /**
     * Client Manager Configuration
     * Declarative configuration pattern mirroring @cruxjs/app AppConfig
     */
    export interface ClientManagerConfig {
        // User-provided route components (REQUIRED)
        routes: Record<string, RouteComponent>;

        // Optional fallback for 404 (if not in routes, must provide here)
        notFoundComponent?: RouteComponent;

        // Root layout - App wraps all pages
        // App creates the structure: loader, modal, and page slot
        rootLayout?: () => JSXElement | null;

        // Debug mode
        debug?: boolean;

        // Lifecycle hooks - called at specific phases
        lifecycle?: ClientManagerHooks;

        // Client-side plugins for extending functionality
        plugins?: ClientPlugin[];

        // i18n configuration (AUTO-INJECTED)
        i18n?: I18nConfig;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝