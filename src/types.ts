// src/types.ts
//
// Made with ❤️ by Maysara.


// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { I18nConfig } from '@minejs/i18n';
import type { JSXElement } from '@minejsx/render';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export type RouteComponent = () => JSXElement | null;

    export interface ClientManagerConfig {
        // User-provided route components (REQUIRED)
        // User decides what pages/components to render at each route
        routes: Record<string, RouteComponent>;

        // Optional fallback for 404 (if not in routes, must provide here)
        notFoundComponent?: RouteComponent;

        // Debug mode
        debug?: boolean;

        // i18n configuration (optional)
        // Enables multi-language support with automatic translation setup
        i18n?: I18nConfig;
    }

    export interface ClientManagerHooks {
        onBoot?: () => void | Promise<void>
        onReady?: () => void | Promise<void>
        onDestroy?: () => void | Promise<void>
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝