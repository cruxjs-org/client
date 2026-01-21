// src/types.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    export type {
        RouteComponent,
        ThemeConfig,
        LangConfig,
        ClientExtension,
        ExtensionContext,
        ClientManagerHooks,
        ClientManagerConfig
    } from '@cruxjs/base';

    
    export type RouteParams = Record<string, string>;

    export interface RouteMatch {
        path: string
        params: RouteParams
        query: URLSearchParams
        hash: string
        route: Route
    }

    export interface RouteContext {
        params: RouteParams
        query: URLSearchParams
        request: Request
        pathname: string
    }

    export class NavigationError extends Error {
        constructor(
            public code: 'LOADER_ERROR' | 'ACTION_ERROR' | 'GUARD_ERROR' | 'ROUTE_NOT_FOUND',
            message: string,
            public cause?: Error
        ) {
            super(message);
            this.name = 'NavigationError';
        }
    }

    export type LoaderFunction<T = any> = (
        context: RouteContext
    ) => T | Promise<T>;

    export type ActionFunction<T = any> = (
        context: RouteContext
    ) => T | Promise<T>;

    export interface Route {
        path: string
        component: () => any | Promise<any>
        loader?: LoaderFunction
        action?: ActionFunction
        children?: Route[]
        meta?: {
            title?: string
            description?: string
            [key: string]: any
        }
        errorComponent?: () => any
    }

    export interface NavigateOptions {
        replace?: boolean
        state?: any
        scroll?: boolean | 'smooth'
    }

    export interface RouterConfig {
        routes: Route[]
        base?: string
        mode?: 'history' | 'hash'
        scrollBehavior?: 'auto' | 'smooth' | 'instant'
        allowedQueryParams?: (string | RegExp)[]
        notFoundComponent?: () => any
        errorComponent?: () => any
        onError?: (error: NavigationError) => void
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
