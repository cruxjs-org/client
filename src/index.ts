// src/index.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { ClientManagerConfig }  from './types';
    import { ClientManager }        from './mod/manager';
    import { setupI18n }            from '@minejs/i18n';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ MAIN ════════════════════════════════════════╗

    export *        from './types';
    export *        from './mod/manager';

    // Start
    export async function start(config: ClientManagerConfig): Promise<ClientManager> {
        // Read i18n config from HTML meta tag (injected by server)
        const metaI18n = document.querySelector('meta[name="app-i18n"]');
        if (metaI18n) {
            const i18nData = JSON.parse(metaI18n.getAttribute('content') || '{}');
            config.i18n = i18nData;
        }

        // Create ClientManager instance
        const manager = new ClientManager(config);

        // Phase 0: Setup I18N
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__i18n = await setupI18n(config.i18n || {
            defaultLanguage: 'en',
            supportedLanguages: ['en'],
        });

        // Phase 1: BOOT
        manager.boot();

        // Phase 2: READY
        manager.ready();

        // Handle cleanup on page unload
        window.addEventListener('beforeunload', async () => {
            await manager.destroy();
        });

        return manager;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
