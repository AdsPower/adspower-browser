import { Browser, Page, chromium } from 'playwright-core';

class BrowserBase {
    private browser: Browser | null;
    private page: Page | null;
    private screenshots: Map<string, string>;

    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshots = new Map();
    }

    get browserInstance() {
        return this.browser;
    }

    get pageInstance() {
        return this.page;
    }

    set pageInstance(page: Page | null) {
        this.page = page;
    }

    get screenshotsInstance() {
        return this.screenshots;
    }

    checkConnected() {
        const error = new Error('Browser not connected, please connect browser first');
        if (!this.browser) {
            throw error;
        }
        if (!this.browser.isConnected()) {
            throw error;
        }
        if (!this.page) {
            throw error;
        }
    }

    async connectBrowserWithWs(wsUrl: string) {
        this.browser = await chromium.connectOverCDP(wsUrl);
        const defaultContext = this.browser.contexts()[0];
        this.page = defaultContext.pages()[0];
        await this.page.bringToFront().catch((error) => {
            console.error('Failed to bring page to front', error);
        });
    }

    async resetBrowser() {
        this.browser = null;
        this.page = null;
    }
}

export default new BrowserBase();
