import LibcurlClient from '@mercuryworkshop/libcurl-transport';
import { defaultConfigDev } from '@mercuryworkshop/scramjet';

// Expose these to the global window object so the non-module script in index.html can use them
(window as any).LibcurlClient = LibcurlClient;
(window as any).defaultConfigDev = defaultConfigDev;
