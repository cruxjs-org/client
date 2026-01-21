<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="../assets/img/router.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <a href="../README.md"><img src="https://img.shields.io/badge/🔥-@cruxjs--client-black"/></a>
    <br>
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    - ### 1. Basic Router Setup

        ```typescript
        const router = createRouter({
            mode        : 'history',
            base        : '/',
            routes      : [
                {
                    path            : '/',
                    component       : HomePage,
                    description     : 'Home page'
                },
                {
                    path            : '/about',
                    component       : AboutPage,
                    description     : 'About page'
                },
                {
                    path            : '/users/:id',
                    component       : UserPage,
                    loader          : async (params) => {
                        return await fetchUser(params.id)
                    }
                },
                {
                    path            : '/*',
                    component       : NotFoundPage,
                    description     : 'Catch-all for 404'
                }
            ],
            scrollBehavior: 'auto'
        })
        ```

    - ### 2. Navigation & Routing

        ```typescript
        // Programmatic navigation
        router.push('/about')
        router.push('/users/123')
        router.replace('/home')

        // History navigation
        router.back()
        router.forward()
        router.go(-2)

        // Check active routes
        router.isActive('/about')
        router.isActive('/users/:id', { exact: true })
        ```

    - ### 3. Route Guards (beforeEach / afterEach)

        ```typescript
        // Before navigation - can return false to prevent
        router.beforeEach((to, from) => {
            if (to.route.requiresAuth && !isLoggedIn()) {
                return false
            }
            return true
        })

        // After navigation - side effects
        router.afterEach((to, from) => {
            analytics.trackPageView(to.path)
            window.scrollTo(0, 0)
        })
        ```

    - ### 4. Accessing Route Data

        ```typescript
        // In component
        import { useRoute, useParams, useQuery, useLoaderData } from '@minejs/router'

        // Current route
        const route = useRoute()

        // Route parameters
        const params = useParams()
        console.log(params.id) // From /users/:id

        // Query string
        const query = useQuery()
        console.log(query.get('sort')) // From ?sort=name

        // Loaded data (from loader function)
        const userData = useLoaderData()
        ```

    - ### 5. Link Component

        ```typescript
        import { Link } from '@minejs/router'

        Link({
            to              : '/about',
            activeClass     : 'active',
            className       : 'nav-link',
            children        : 'About'
        })

        // With replace
        Link({
            to              : '/home',
            replace         : true,
            children        : 'Go Home'
        })
        ```

    - ### 6. Error Handling

        ```typescript
        router.onError((error) => {
            if (error.code === 'LOADER_ERROR') {
                console.error('Failed to load data:', error.message)
            } else if (error.code === 'GUARD_ERROR') {
                console.error('Guard rejected navigation:', error.message)
            } else if (error.code === 'ROUTE_NOT_FOUND') {
                // Render 404 page
            }
        })

        // Error state available reactively
        import { useRouter } from '@minejs/router'
        const router = useRouter()
        const error  = router.error // Signal<NavigationError | null>
        ```

    - ### 7. RouterOutlet Component

        ```typescript
        import { RouterOutlet } from '@minejs/router'

        // Renders current route component with error boundary
        RouterOutlet({
            // Optional error fallback
            errorFallback: (error) => jsx('div', {
                children: `Navigation error: ${error.message}`
            })
        })
        ```

<br>

- ## API Reference 🔥

    - #### `createRouter(config: RouterConfig): Router`
        > Create a new router instance with configuration.

        ```typescript
        interface RouterConfig {
            mode?               : 'history' | 'hash'                    // URL mode (default: 'history')
            base?               : string                                // Base path (default: '')
            routes              : Route[]                               // Route definitions
            scrollBehavior?     : 'auto' | 'smooth' | 'none'            // Scroll behavior (default: 'auto')
            allowedQueryParams? : (string | RegExp)[]                   // Whitelist of allowed query params
            notFoundComponent?  : ComponentType                         // 404 component (optional)
            onError?            : (error: NavigationError) => void      // Global error handler (optional)
        }

        const router = createRouter({
            mode                : 'history',
            base                : '/',
            routes              : [/* ... */],
            scrollBehavior      : 'auto',
            allowedQueryParams  : ['page', 'sort', /^filter_/]
        })
        ```

    - #### `Router.addAllowedQueryParam(param: string | RegExp): void`

        > Add a query parameter to the whitelist at runtime.

        ```typescript
        router.addAllowedQueryParam('theme')
        router.addAllowedQueryParam(/^utm_/)
        ```

    - #### `Router.push(path: string, options?: NavigateOptions): void`

        > Navigate to path with history.

        ```typescript
        router.push('/about')
        router.push('/users/123?tab=profile')
        router.push('/home', { skipGuards: false })
        ```

    - #### `Router.replace(path: string, options?: NavigateOptions): void`

        > Navigate to path replacing current history entry.

        ```typescript
        router.replace('/new-path')
        // Browser history doesn't have previous entry
        ```

    - #### `Router.back(): void`

        > Navigate back in history (like browser back button).

        ```typescript
        router.back()
        ```

    - #### `Router.forward(): void`

        > Navigate forward in history (like browser forward button).

        ```typescript
        router.forward()
        ```

    - #### `Router.go(delta: number): void`

        > Navigate to specific history entry by delta.

        ```typescript
        router.go(-1)  // Same as back()
        router.go(2)   // Jump forward 2 entries
        ```

    - #### `Router.isActive(path: string, exact?: boolean): boolean`

        > Check if path is currently active.

        ```typescript
        router.isActive('/about')
        router.isActive('/users/:id', { exact: true })
        ```

    - #### `Router.getParams(): RouteParams`

        > Get current route parameters.

        ```typescript
        const params = router.getParams()
        console.log(params.id)
        ```

    - #### `Router.getQuery(): URLSearchParams`

        > Get current query string parameters.

        ```typescript
        const query = router.getQuery()
        console.log(query.get('sort'))
        ```

    - #### `Router.beforeEach(guard: (to, from) => boolean | Promise<boolean>): () => void`

        > Register guard to run before navigation (can prevent navigation).

        ```typescript
        const unregister = router.beforeEach((to, from) => {
            if (to.route.protected && !isAuthed()) return false
            return true
        })

        unregister() // Remove guard
        ```

    - #### `Router.afterEach(guard: (to, from) => void): () => void`

        > Register guard to run after successful navigation.

        ```typescript
        const unregister = router.afterEach((to, from) => {
            console.log(`Navigated from ${from.path} to ${to.path}`)
        })

        unregister() // Remove guard
        ```

    - #### `Router.onError(handler: (error: NavigationError) => void): () => void`

        > Register error handler for navigation errors.

        ```typescript
        const unregister = router.onError((error) => {
            console.error(`${error.code}: ${error.message}`)
        })

        unregister() // Remove handler
        ```

    - #### `Router.reload(): Promise<void>`

        > Reload current route.

        ```typescript
        await router.reload()
        ```

    - #### `Router.destroy(): void`

        > Clean up router (remove listeners, abort pending operations).

        ```typescript
        router.destroy()
        // Call when unmounting app
        ```

    - #### `useRouter(): Router`

        > Get router instance in components.

        ```typescript
        const router = useRouter()
        router.push('/about')
        ```

    - #### `useRoute(): Signal<RouteMatch | null>`

        > Get current route reactively.

        ```typescript
        const route = useRoute()
        console.log(route().path)
        ```

    - #### `useParams(): RouteParams`

        > Get current route parameters.

        ```typescript
        const params = useParams()
        console.log(params.userId)
        ```

    - #### `useQuery(): URLSearchParams`

        > Get current query string parameters.

        ```typescript
        const query = useQuery()
        console.log(query.get('sort'))
        ```

    - #### `useLoaderData<T>(): Signal<T | null>`

        > Get data from route loader function.

        ```typescript
        const userData = useLoaderData<User>()
        console.log(userData().name)
        ```

    - #### `useNavigate(): (path: string) => void`

        > Get navigation function for components.

        ```typescript
        const navigate = useNavigate()
        navigate('/about')
        ```

    - #### `Link(props: LinkProps): JSXElement`

        > Create navigation link with active state.

        ```typescript
        interface LinkProps {
            to: string                  // Navigation target
            children: any               // Link content
            activeClass?: string        // Class when active
            exact?: boolean             // Exact match for active (default: false)
            replace?: boolean           // Use replace instead of push (default: false)
            className?: string          // Additional classes
            [key: string]: any         // HTML attributes
        }

        Link({
            to: '/about',
            activeClass: 'active',
            children: 'About'
        })
        ```

    - #### `RouterOutlet(props?: OutletProps): JSXElement`

        > Render current route component with error boundary.

        ```typescript
        interface OutletProps {
            errorFallback?: (error: NavigationError) => JSXElement
        }

        RouterOutlet({
            errorFallback: (error) => jsx('div', {
                children: `Error: ${error.message}`
            })
        })
        ```

    - #### `Route`

        > Route definition object.

        ```typescript
        interface Route {
            path: string                                        // Route path (/about, /users/:id, /*)
            component: (props: any) => JSXElement              // Component to render
            description?: string                                // Meta description
            errorComponent?: (error: NavigationError) => JSXElement  // Error fallback
            loader?: (params: RouteParams) => Promise<any>     // Async data loader
            action?: (params: RouteParams, data: any) => Promise<any>  // Async action handler
            requiresAuth?: boolean                              // Authentication requirement
            children?: Route[]                                  // Child routes
            beforeEnter?: (to: RouteMatch, from: RouteMatch | null) => boolean  // Route-specific guard
        }
        ```

    - #### `NavigationError`

        > Error object for navigation failures.

        ```typescript
        interface NavigationError extends Error {
            code: 'LOADER_ERROR' | 'ACTION_ERROR' | 'GUARD_ERROR' | 'ROUTE_NOT_FOUND'
            message: string
            route?: Route
            path?: string
        }
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

- ## Real-World Examples

  - #### Basic App with Navigation

    ```typescript
    import { createRouter, RouterOutlet, Link, useRouter } from '@minejs/router'
    import { jsx } from '@minejs/jsx'
    import { render } from '@minejs/jsx'

    // Define routes
    const router = createRouter({
        mode: 'history',
        routes: [
            {
                path: '/',
                component: () => jsx('div', { children: 'Home' }),
                description: 'Home page'
            },
            {
                path: '/about',
                component: () => jsx('div', { children: 'About' }),
                description: 'About page'
            },
            {
                path: '/*',
                component: () => jsx('div', { children: '404 Not Found' })
            }
        ]
    })

    // App component with navigation
    const App = () => jsx('div', {
        className: 'app',
        children: [
            jsx('nav', {
                children: [
                    Link({ to: '/', children: 'Home' }),
                    Link({ to: '/about', activeClass: 'active', children: 'About' })
                ]
            }),
            RouterOutlet()
        ]
    })

    render(App, '#app')
    ```

  - #### Dynamic Routes with Parameters

    ```typescript
    import { createRouter, useParams, useRoute } from '@minejs/router'

    const router = createRouter({
        routes: [
            {
                path: '/users/:id',
                component: () => {
                    const params = useParams()
                    const route = useRoute()

                    return jsx('div', {
                        children: `User ID: ${params.id}`
                    })
                },
                loader: async (params) => {
                    const response = await fetch(`/api/users/${params.id}`)
                    return await response.json()
                }
            }
        ]
    })

    // Navigate to /users/123
    router.push('/users/123')
    ```

  - #### Route Guards & Authentication

    ```typescript
    import { createRouter } from '@minejs/router'

    const isLoggedIn = signal(false)

    const router = createRouter({
        routes: [
            {
                path: '/dashboard',
                component: DashboardPage,
                requiresAuth: true
            }
        ]
    })

    // Global beforeEach guard
    router.beforeEach((to, from) => {
        if (to.route.requiresAuth && !isLoggedIn()) {
            router.push('/login')
            return false
        }
        return true
    })

    // Navigate to /dashboard
    router.push('/dashboard')
    // Will redirect to /login if not authenticated
    ```

  - #### Error Handling

    ```typescript
    import { createRouter } from '@minejs/router'

    const router = createRouter({
        routes: [/* ... */],
        onError: (error) => {
            console.error(`Navigation error: ${error.code}`)
        }
    })

    // Register additional error handler
    router.onError((error) => {
        if (error.code === 'LOADER_ERROR') {
            showNotification('Failed to load data')
        } else if (error.code === 'ROUTE_NOT_FOUND') {
            showNotification('Page not found')
        }
    })

    // Errors are also stored reactively
    const { error } = useRouter()
    if (error()) {
        console.log(`Error: ${error().message}`)
    }
    ```

  - #### Query Parameters

    ```typescript
    import { createRouter, useQuery } from '@minejs/router'

    const router = createRouter({
        routes: [
            {
                path: '/search',
                component: () => {
                    const query = useQuery()
                    const searchTerm = query.get('q')
                    const sort = query.get('sort') || 'date'

                    return jsx('div', {
                        children: `Search: ${searchTerm} (sorted by ${sort})`
                    })
                }
            }
        ]
    })

    // Navigate to /search?q=router&sort=name
    router.push('/search?q=router&sort=name')
    ```

  - #### Query Parameter Filtering (Whitelist)

    ```typescript
    import { createRouter } from '@minejs/router'

    const router = createRouter({
        routes: [/* ... */],
        // Only allow specific query parameters
        allowedQueryParams: [
            'page',
            'sort',
            'q',
            /^filter_/,  // Regex for patterns like filter_date, filter_type
            /^utm_/      // Allow UTM tracking params
        ]
    })

    // Navigation with disallowed params:
    router.push('/search?q=test&forbidden=123')
    // Result URL: /search?q=test

    // Add more allowed params at runtime:
    router.addAllowedQueryParam('theme')
    ```

  - #### Nested Routes

    ```typescript
    import { createRouter } from '@minejs/router'

    const router = createRouter({
        routes: [
            {
                path: '/admin',
                component: AdminLayout,
                children: [
                    {
                        path: '/users',
                        component: UsersList,
                        loader: async () => {
                            return await fetchUsers()
                        }
                    },
                    {
                        path: '/settings',
                        component: SettingsPage
                    }
                ]
            }
        ]
    })

    // Navigate to /admin/users or /admin/settings
    router.push('/admin/users')
    ```

  - #### Programmatic History Management

    ```typescript
    import { createRouter } from '@minejs/router'

    const router = createRouter({
        routes: [/* ... */]
    })

    // Navigate forward and backward
    router.push('/page1')
    router.push('/page2')
    router.push('/page3')

    router.back()      // Go to /page2
    router.back()      // Go to /page1
    router.forward()   // Go to /page2
    router.go(-1)      // Same as back()
    router.go(2)       // Jump forward 2 pages
    ```

    <br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
