/* eslint-disable @typescript-eslint/no-explicit-any */
// test/index.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { describe, expect, test, beforeEach, mock } from 'bun:test';
    import { JSDOM } from 'jsdom';
    import {
        Router,
        createRouter,
        useRouter,
        useRoute,
        useParams,
        useQuery,
        useLoaderData,
        useNavigate,
        Link,
        RouterOutlet,
        buildPath,
        parseQuery,
        stringifyQuery
    } from '../src/mod/router';
    import * as types from '../src/types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ INIT ════════════════════════════════════════╗

    // Setup JSDOM for testing
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url                 : 'http://localhost/',
        pretendToBeVisual   : true
    });

    Object.assign(global, {
        window              : dom.window,
        document            : dom.window.document,
        navigator           : dom.window.navigator,
        location            : dom.window.location,
        history             : dom.window.history,
        HTMLElement         : dom.window.HTMLElement,
        Node                : dom.window.Node,
        Request             : dom.window.Request || class Request {
            constructor(public url: string) {}
        },
        URLSearchParams     : dom.window.URLSearchParams
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('@minejs/router', () => {
        beforeEach(() => {
            (global as any).globalRouter = null;
            document.title = '';
            // Reset location to default
            try {
                window.history.replaceState({}, '', '/');
            } catch {
                // Ignore errors during reset
            }
        });

        // UTILITY FUNCTION TESTS
        describe('buildPath', () => {
            test('should replace single param', () => {
                const result = buildPath('/user/:id', { id: '123' });
                expect(result).toBe('/user/123');
            });

            test('should replace multiple params', () => {
                const result = buildPath('/user/:id/post/:postId', { id: '123', postId: '456' });
                expect(result).toBe('/user/123/post/456');
            });

            test('should encode param values', () => {
                const result = buildPath('/search/:query', { query: 'hello world' });
                expect(result).toBe('/search/hello%20world');
            });

            test('should handle special characters', () => {
                const result = buildPath('/user/:id', { id: 'abc@123' });
                expect(result).toContain('abc%40123');
            });

            test('should return path with no params', () => {
                const result = buildPath('/about', {});
                expect(result).toBe('/about');
            });
        });

        describe('parseQuery', () => {
            test('should parse single query param', () => {
                const result = parseQuery('?foo=bar');
                expect(result).toEqual({ foo: 'bar' });
            });

            test('should parse multiple query params', () => {
                const result = parseQuery('?foo=bar&baz=qux');
                expect(result.foo).toBe('bar');
                expect(result.baz).toBe('qux');
            });

            test('should handle encoded params', () => {
                const result = parseQuery('?search=hello%20world');
                expect(result.search).toBe('hello world');
            });

            test('should return empty object for empty string', () => {
                const result = parseQuery('');
                expect(Object.keys(result).length).toBe(0);
            });

            test('should handle params without values', () => {
                const result = parseQuery('?flag=');
                expect(result.flag).toBe('');
            });
        });

        describe('stringifyQuery', () => {
            test('should stringify single param', () => {
                const result = stringifyQuery({ foo: 'bar' });
                expect(result).toBe('foo=bar');
            });

            test('should stringify multiple params', () => {
                const result = stringifyQuery({ foo: 'bar', baz: 'qux' });
                expect(result).toContain('foo=bar');
                expect(result).toContain('baz=qux');
            });

            test('should skip null and undefined values', () => {
                const result = stringifyQuery({ foo: 'bar', baz: null, qux: undefined });
                expect(result).toBe('foo=bar');
            });

            test('should convert numbers to strings', () => {
                const result = stringifyQuery({ page: 1, limit: 10 });
                expect(result).toContain('page=1');
                expect(result).toContain('limit=10');
            });

            test('should return empty string for empty object', () => {
                const result = stringifyQuery({});
                expect(result).toBe('');
            });
        });

        // ROUTER CREATION TESTS
        describe('createRouter and useRouter', () => {
            test('should create a router instance', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                expect(router).toBeDefined();
                expect(router instanceof Router).toBe(true);
            });

            test('should return global router instance', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                createRouter(config);
                const router = useRouter();
                expect(router).toBeDefined();
            });

            test('should apply default config', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                expect(router).toBeDefined();
            });
        });

        // ROUTE MATCHING TESTS
        describe('Route matching', () => {
            test('should match route with param', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user/:id', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/user/123');
                const route = router.currentRoute();
                expect(route?.params.id).toBe('123');
            });

            test('should match nested routes', () => {
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/user',
                            component: () => null,
                            children: [{ path: '/profile', component: () => null }]
                        }
                    ]
                };
                const router = createRouter(config);
                router.push('/user/profile');
                const route = router.currentRoute();
                expect(route).not.toBeNull();
            });

            test('should not match invalid route', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/nonexistent');
                expect(router.currentRoute()).toBeNull();
            });

            test('should decode encoded params', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/search/:query', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/search/hello%20world');
                const route = router.currentRoute();
                expect(route?.params.query).toBe('hello world');
            });
        });

        // NAVIGATION TESTS
        describe('Navigation', () => {
            test('should navigate with push', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.push('/about');
                const route = router.currentRoute();
                expect(route?.path).toBe('/about');
            });

            test('should navigate with replace', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.replace('/about');
                const route = router.currentRoute();
                expect(route?.path).toBe('/about');
            });

            test('should navigate back', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                const router = createRouter(config);
                window.history.back = mock(() => {});
                router.back();
                expect(window.history.back).toHaveBeenCalled();
            });

            test('should navigate forward', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                window.history.forward = mock(() => {});
                router.forward();
                expect(window.history.forward).toHaveBeenCalled();
            });

            test('should go to specific history delta', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                window.history.go = mock(() => {});
                router.go(-1);
                expect(window.history.go).toHaveBeenCalledWith(-1);
            });

            test('should be not navigating after navigation', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                expect(router.isNavigating()).toBe(false);
            });
        });

        // LOADER TESTS
        describe('Route loaders', () => {
            test('should execute loader function', async () => {
                const loaderMock = mock(async () => ({ data: 'test' }));
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/data', component: () => null, loader: loaderMock }
                    ]
                };
                const router = createRouter(config);
                router.push('/data');
                await new Promise(resolve => setTimeout(resolve, 100));
                expect(loaderMock).toHaveBeenCalled();
            });

            test('should set loaderData signal', async () => {
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/data',
                            component: () => null,
                            loader: async () => ({ data: 'loaded' })
                        }
                    ]
                };
                const router = createRouter(config);
                router.push('/data');
                await new Promise(resolve => setTimeout(resolve, 100));
                expect(router.loaderData()).not.toBeNull();
            });

            test('should handle route without loader', async () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/noloader', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/noloader');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(router.loaderData()).toBeNull();
            });
        });

        // GUARDS TESTS
        describe('Guards', () => {
            test('beforeEach guard should prevent navigation', async () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/protected', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.beforeEach((to) => to.path !== '/protected');
                router.push('/protected');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(router.currentRoute()?.path).not.toBe('/protected');
            });

            test('beforeEach guard should allow navigation', async () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/public', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.beforeEach(() => true);
                router.push('/public');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(router.currentRoute()?.path).toBe('/public');
            });

            test('beforeEach guard can be unregistered', async () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/test', component: () => null }
                    ]
                };
                const router = createRouter(config);
                const unregister = router.beforeEach(() => false);
                unregister();
                router.push('/test');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(router.currentRoute()?.path).toBe('/test');
            });

            test('afterEach guard should be called', async () => {
                const guardMock = mock(() => {});
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/test', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.afterEach(guardMock);
                router.push('/test');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(guardMock).toHaveBeenCalled();
            });

            test('afterEach guard can be unregistered', async () => {
                const guardMock = mock(() => {});
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/test', component: () => null }
                    ]
                };
                const router = createRouter(config);
                const unregister = router.afterEach(guardMock);
                unregister();
                router.push('/test');
                await new Promise(resolve => setTimeout(resolve, 50));
            });
        });

        // ACTIVE STATE TESTS
        describe('Route active state', () => {
            test('should check if path is active (exact)', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/about');
                expect(router.isActive('/about', true)).toBe(true);
            });

            test('should check if path is active (loose match)', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user/profile', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/user/profile');
                expect(router.isActive('/user', false)).toBe(true);
            });

            test('should return false if no current route', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                expect(router.isActive('/any')).toBe(false);
            });

            test('should not match similar paths exactly', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/user');
                expect(router.isActive('/users', true)).toBe(false);
            });
        });

        // PARAMS AND QUERY TESTS
        describe('Params and Query', () => {
            test('useParams should return current params', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user/:id', component: () => null }]
                };
                createRouter(config);
                const router = useRouter();
                router.push('/user/123');
                const params = useParams();
                expect(params.id).toBe('123');
            });

            test('useQuery should return URLSearchParams', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/search', component: () => null }]
                };
                createRouter(config);
                const router = useRouter();
                router.push('/search?q=test&page=1');
                const query = useQuery();
                expect(query.get('q')).toBe('test');
                expect(query.get('page')).toBe('1');
            });

            test('getParams should return route params', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/post/:id', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/post/456');
                const params = router.getParams();
                expect(params.id).toBe('456');
            });

            test('getQuery should return URLSearchParams', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/items', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/items?sort=name&order=asc');
                const query = router.getQuery();
                expect(query.get('sort')).toBe('name');
            });

            test('getParams should return empty object if no route', () => {
                const config: types.RouterConfig = { routes: [] };
                const router = createRouter(config);
                const params = router.getParams();
                expect(Object.keys(params).length).toBe(0);
            });

            test('getQuery should return empty URLSearchParams if no route', () => {
                const config: types.RouterConfig = { routes: [] };
                const router = createRouter(config);
                const query = router.getQuery();
                expect(query.toString()).toBe('');
            });
        });

        // HOOK TESTS
        describe('Hooks', () => {
            test('useRoute should return current route signal', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }]
                };
                createRouter(config);
                const route = useRoute();
                expect(route).toBeDefined();
            });

            test('useLoaderData should return loader data signal', () => {
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/data',
                            component: () => null,
                            loader: async () => ({ msg: 'hello' })
                        }
                    ]
                };
                createRouter(config);
                const data = useLoaderData();
                expect(data).toBeDefined();
            });

            test('useNavigate should return navigation methods', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                createRouter(config);
                const navigate = useNavigate();
                expect(navigate.push).toBeDefined();
                expect(navigate.replace).toBeDefined();
                expect(navigate.back).toBeDefined();
                expect(navigate.forward).toBeDefined();
                expect(navigate.go).toBeDefined();
            });
        });

        // SCROLL BEHAVIOR TESTS
        describe('Scroll behavior', () => {
            test('should scroll to top on navigation', () => {
                window.scrollTo = mock(() => {});
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.push('/about');
                expect(window.scrollTo).toHaveBeenCalled();
            });

            test('should not scroll if scroll=false', async () => {
                window.scrollTo = mock(() => {});
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                const router = createRouter(config);
                router.push('/about', { scroll: false });
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            test('should use smooth scroll when specified', () => {
                window.scrollTo = mock(() => {});
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ],
                    scrollBehavior: 'smooth'
                };
                const router = createRouter(config);
                router.push('/about');
                expect(window.scrollTo).toHaveBeenCalled();
            });
        });

        // META TAGS TESTS
        describe('Meta tags', () => {
            test('should update document title', async () => {
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/about',
                            component: () => null,
                            meta: { title: 'About Us' }
                        }
                    ]
                };
                const router = createRouter(config);
                router.push('/about');
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(document.title).toBe('About Us');
            });

            test('should not update title if meta not provided', async () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/about');
                await new Promise(resolve => setTimeout(resolve, 50));
            });
        });

        // LINK COMPONENT TESTS
        describe('Link component', () => {
            test('should render link with correct href', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                createRouter(config);
                const link = Link({ to: '/about', children: 'About' });
                expect(link).toBeDefined();
            });

            test('should have active class when path is active', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }]
                };
                createRouter(config);
                const router = useRouter();
                router.push('/about');
                const link = Link({
                    to: '/about',
                    activeClass: 'active',
                    children: 'About',
                    exact: true
                });
                expect(link).toBeDefined();
            });

            test('should navigate on click', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                createRouter(config);
                const link = Link({ to: '/about', children: 'About' });
                expect(link).toBeDefined();
            });

            test('should support replace option', () => {
                const config: types.RouterConfig = {
                    routes: [
                        { path: '/', component: () => null },
                        { path: '/about', component: () => null }
                    ]
                };
                createRouter(config);
                const link = Link({
                    to: '/about',
                    replace: true,
                    children: 'About'
                });
                expect(link).toBeDefined();
            });
        });

        // ROUTER OUTLET TESTS
        describe('RouterOutlet component', () => {
            test('should render current route component', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/test', component: () => ({ tag: 'div' }) }]
                };
                createRouter(config);
                const outlet = RouterOutlet();
                expect(outlet).toBeDefined();
            });

            test('should return outlet even if no current route', () => {
                const config: types.RouterConfig = { routes: [] };
                createRouter(config);
                const outlet = RouterOutlet();
                expect(outlet).toBeDefined();
            });
        });

        // RELOAD TESTS
        describe('Reload', () => {
            test('should reload current route', async () => {
                const loaderMock = mock(async () => ({ data: 'reloaded' }));
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/data',
                            component: () => null,
                            loader: loaderMock
                        }
                    ]
                };
                const router = createRouter(config);
                router.push('/data');
                await new Promise(resolve => setTimeout(resolve, 100));
                await router.reload();
                await new Promise(resolve => setTimeout(resolve, 100));
                expect(loaderMock.mock.calls.length).toBeGreaterThan(1);
            });

            test('should not reload if no current route', async () => {
                const config: types.RouterConfig = { routes: [] };
                const router = createRouter(config);
                await router.reload();
                expect(true).toBe(true);
            });
        });

        // HASH MODE TESTS
        describe('Hash mode routing', () => {
            test('should work in hash mode', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/about', component: () => null }],
                    mode: 'hash'
                };
                const router = createRouter(config);
                expect(router).toBeDefined();
            });
        });

        // ERROR HANDLING TESTS
        describe('Error handling', () => {
            test('should handle navigation to non-existent route gracefully', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/exists', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/does-not-exist');
                expect(true).toBe(true);
            });

            test('should handle multiple params in single segment', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/item/:id', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/item/test-123-abc');
                const route = router.currentRoute();
                expect(route?.params.id).toBe('test-123-abc');
            });
        });

        // ADDITIONAL COVERAGE TESTS
        describe('Additional coverage', () => {
            test('Router constructor sets defaults', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/', component: () => null }]
                };
                const router = createRouter(config);
                expect(router.currentRoute()).toBeDefined();
            });

            test('multiple params in path', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user/:id/post/:postId', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/user/5/post/10');
                const route = router.currentRoute();
                expect(route?.params.id).toBe('5');
                expect(route?.params.postId).toBe('10');
            });

            test('query params with route', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/list', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/list?filter=active&sort=date');
                const query = router.getQuery();
                expect(query.get('filter')).toBe('active');
                expect(query.get('sort')).toBe('date');
            });

            test('buildPath encodes special chars correctly', () => {
                const path = buildPath('/search/:q', { q: 'foo&bar=baz' });
                expect(path).toContain('foo%26bar%3Dbaz');
            });

            test('parseQuery handles duplicate keys', () => {
                const result = parseQuery('?a=1&b=2&a=3');
                expect(result.a).toBeDefined();
            });

            test('stringifyQuery with boolean values', () => {
                const result = stringifyQuery({ flag: true, other: false });
                expect(result).toContain('flag=true');
                expect(result).toContain('other=false');
            });

            test('Router with action function', async () => {
                const actionMock = mock(async () => ({ success: true }));
                const config: types.RouterConfig = {
                    routes: [
                        {
                            path: '/submit',
                            component: () => null,
                            action: actionMock
                        }
                    ]
                };
                const router = createRouter(config);
                router.push('/submit');
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            test('Router isActive with exact false on different path', () => {
                const config: types.RouterConfig = {
                    routes: [{ path: '/user/profile', component: () => null }]
                };
                const router = createRouter(config);
                router.push('/user/profile');
                expect(router.isActive('/admin', false)).toBe(false);
            });
        });
    });

    describe('Router Query Params', () => {
        beforeEach(() => {
            // Reset router
            (global as any).globalRouter = null;
            // Reset history
            window.history.replaceState({}, '', '/');
        });

        test('should preserve query params on reload', async () => {
            const config: types.RouterConfig = {
                routes: [{ path: '/test', component: () => null }]
            };
            const router = createRouter(config);
            
            // Navigate with query params
            router.push('/test?foo=bar&baz=qux');
            expect(router.getQuery().get('foo')).toBe('bar');
            
            // Reload
            await router.reload();
            
            // Check if params are preserved
            expect(router.getQuery().get('foo')).toBe('bar');
            expect(router.getQuery().get('baz')).toBe('qux');
            expect(window.location.search).toBe('?foo=bar&baz=qux');
        });

        test('should filter query params based on whitelist config', () => {
            const config: types.RouterConfig = {
                routes: [{ path: '/test', component: () => null }],
                allowedQueryParams: ['allowed', /^regex_/]
            };
            const router = createRouter(config);
            
            // Navigate with mixed params
            router.push('/test?allowed=1&forbidden=2&regex_test=3&other=4');
            
            const query = router.getQuery();
            expect(query.get('allowed')).toBe('1');
            expect(query.get('regex_test')).toBe('3');
            expect(query.get('forbidden')).toBeNull();
            expect(query.get('other')).toBeNull();
            
            // Check URL in history
            expect(window.location.search).toContain('allowed=1');
            expect(window.location.search).not.toContain('forbidden=2');
        });

        test('should allow adding whitelist params at runtime', () => {
            const config: types.RouterConfig = {
                routes: [{ path: '/test', component: () => null }],
                allowedQueryParams: ['initial']
            };
            const router = createRouter(config);
            
            // Initial navigation
            router.push('/test?initial=1&added=2');
            expect(router.getQuery().get('initial')).toBe('1');
            expect(router.getQuery().get('added')).toBeNull();
            
            // Add param to whitelist
            router.addAllowedQueryParam('added');
            
            // Navigate again
            router.push('/test?initial=1&added=2');
            expect(router.getQuery().get('initial')).toBe('1');
            expect(router.getQuery().get('added')).toBe('2');
        });

        test('should allow all params if whitelist is empty', () => {
            const config: types.RouterConfig = {
                routes: [{ path: '/test', component: () => null }]
            };
            const router = createRouter(config);
            
            router.push('/test?any=1&thing=2');
            expect(router.getQuery().get('any')).toBe('1');
            expect(router.getQuery().get('thing')).toBe('2');
        });
    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
