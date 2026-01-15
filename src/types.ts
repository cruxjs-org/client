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
     * Client-side extension system
     * Extensions can hook into lifecycle phases to extend functionality
     * (logging, analytics, error handling, etc.)
     */
    export interface ClientExtension {
        name: string;
        config?: Record<string, unknown>;
        onBoot?: (context: ExtensionContext) => void | Promise<void>;
        onReady?: (context: ExtensionContext) => void | Promise<void>;
        onDestroy?: (context: ExtensionContext) => void | Promise<void>;
    }

    /**
     * Context passed to extension lifecycle hooks
     */
    export interface ExtensionContext {
        debug   : boolean;
        config  : Record<string, unknown>;
        cconfig : ClientManagerConfig;
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

        // Client-side extensions for extending functionality
        extensions?: ClientExtension[];

        // i18n configuration (AUTO-INJECTED)
        i18n?: I18nConfig;

        // Theme configuration
        theme?: ThemeConfig;
    }

    // Theme configuration
    export interface ThemeConfig {
        default: string;        // Default theme name
        available: string[];    // Array of available theme names
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝