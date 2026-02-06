import path from 'path';
import os from 'os';
import type { CreateAutomationParams, NavigateParams, ScreenshotParams, ClickElementParams, FillInputParams, SelectOptionParams, HoverElementParams, ScrollElementParams, PressKeyParams, EvaluateScriptParams, DragElementParams, IframeClickElementParams } from '../types/browser.js';
import browser from '../utils/browserBase.js';

const defaultDownloadsPath = path.join(os.homedir(), 'Downloads');

export const automationHandlers = {
    async connectBrowserWithWs({ wsUrl }: CreateAutomationParams) {
        try {
            await browser.connectBrowserWithWs(wsUrl);
            return `Browser connected successfully with: ${wsUrl}`;
        } catch (error) {
            return `Failed to connect browser with: ${error?.toString()}`;
        }
    },
    async openNewPage() {
        browser.checkConnected();
        const newPage = await browser.pageInstance!.context().newPage();
        browser.pageInstance = newPage;
        return `New page opened successfully`;
    },
    async navigate({ url }: NavigateParams) {
        browser.checkConnected();
        await browser.pageInstance!.goto(url);
        return `Navigated to ${url} successfully`;
    },
    async screenshot({ savePath, isFullPage }: ScreenshotParams) {
        browser.checkConnected();
        const filename = `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;
        const outputPath = path.join(savePath || defaultDownloadsPath, filename);
        const screenshot = await browser.pageInstance!.screenshot({ path: outputPath, fullPage: isFullPage });
        const screenshotBase64 = screenshot.toString('base64');
        browser.screenshotsInstance.set(filename, screenshotBase64);
        return [{
            type: 'image' as const,
            data: screenshotBase64,
            mimeType: 'image/png'
        }];
    },
    async getPageVisibleText() {
        browser.checkConnected();
        try {
            const visibleText = await browser.pageInstance!.evaluate(() => {
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: (node) => {
                            const style = window.getComputedStyle(
                                node.parentElement!
                            );
                            return style.display !== 'none' &&
                                style.visibility !== 'hidden'
                                ? NodeFilter.FILTER_ACCEPT
                                : NodeFilter.FILTER_REJECT;
                        },
                    }
                );
                let text = '';
                let node;
                while ((node = walker.nextNode())) {
                    const trimmedText = node.textContent?.trim();
                    if (trimmedText) {
                        text += trimmedText + '\n';
                    }
                }
                return text.trim();
            });
            return `Visible text content:\n${visibleText}`;
        } catch (error) {
            return `Failed to get visible text content: ${(error as Error).message}`;
        }
    },
    async getPageHtml() {
        browser.checkConnected();
        const html = await browser.pageInstance!.content();
        return html;
    },
    async clickElement({ selector }: ClickElementParams) {
        browser.checkConnected();
        await browser.pageInstance!.click(selector);
        return `Clicked element with selector: ${selector} successfully`;
    },
    async iframeClickElement({ selector, iframeSelector }: IframeClickElementParams) {
        const frame = browser.pageInstance!.frameLocator(iframeSelector);
        if (!frame) {
            return `Iframe not found: ${iframeSelector}`;
        }

        await frame.locator(selector).click();
        return `Clicked element ${selector} inside iframe ${iframeSelector} successfully`;
    },
    async fillInput({ selector, text }: FillInputParams) {
        browser.checkConnected();
        await browser.pageInstance!.waitForSelector(selector);
        await browser.pageInstance!.fill(selector, text);
        return `Filled input with selector: ${selector} with text: ${text} successfully`;
    },
    async selectOption({ selector, value }: SelectOptionParams) {
        browser.checkConnected();
        await browser.pageInstance!.waitForSelector(selector);
        await browser.pageInstance!.selectOption(selector, value);
        return `Selected option with selector: ${selector} with value: ${value} successfully`;
    },
    async hoverElement({ selector }: HoverElementParams) {
        browser.checkConnected();
        await browser.pageInstance!.waitForSelector(selector);
        await browser.pageInstance!.hover(selector);
        return `Hovered element with selector: ${selector} successfully`;
    },
    async scrollElement({ selector }: ScrollElementParams) {
        browser.checkConnected();
        await browser.pageInstance!.waitForSelector(selector);
        await browser.pageInstance!.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, selector);
        return `Scrolled element with selector: ${selector} successfully`;
    },
    async pressKey({ key, selector }: PressKeyParams) {
        browser.checkConnected();
        if (selector) {
            await browser.pageInstance!.waitForSelector(selector);
            await browser.pageInstance!.focus(selector);
        }
        await browser.pageInstance!.keyboard.press(key);
        return `Pressed key: ${key} successfully`;
    },
    async evaluateScript({ script }: EvaluateScriptParams) {
        browser.checkConnected();
        const result = await browser.pageInstance!.evaluate(script);
        return result;
    },
    async dragElement({ selector, targetSelector }: DragElementParams) {
        browser.checkConnected();
        const sourceElement = await browser.pageInstance!.waitForSelector(selector);
        const targetElement = await browser.pageInstance!.waitForSelector(targetSelector);

        const sourceBound = await sourceElement.boundingBox();
        const targetBound = await targetElement.boundingBox();

        if (!sourceBound || !targetBound) {
            return `Could not get element positions for drag operation`;
        }

        await browser.pageInstance!.mouse.move(
            sourceBound.x + sourceBound.width / 2,
            sourceBound.y + sourceBound.height / 2
        );
        await browser.pageInstance!.mouse.down();
        await browser.pageInstance!.mouse.move(
            targetBound.x + targetBound.width / 2,
            targetBound.y + targetBound.height / 2
        );
        await browser.pageInstance!.mouse.up();
        return `Dragged element with selector: ${selector} to ${targetSelector} successfully`;
    }
};

export const getScreenshot = (filename: string) => {
    return browser.screenshotsInstance.get(filename);
};
