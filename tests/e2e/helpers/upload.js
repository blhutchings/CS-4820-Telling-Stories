//eslint-disable-next-line import/no-extraneous-dependencies
const puppeteer = require('puppeteer');

let serverHost;
let browser;
let page;
let resolveEditorFunctions = {};


async function beforeAll(host) {
    serverHost = host;
    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--headless',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        ignoreDefaultArgs: ['--mute-audio']
    });
    page = await browser.newPage();
    await page.setCacheEnabled(true);
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
    );

    // the function onEditorLoaded is called in the browser when the H5P
    // editor has finished loading. To be able to wait for this event, we
    // collect the resolve function of the promises in the
    // resolveEditorFunctions object.
    await page.exposeFunction('onEditorLoaded', (key) => {
        resolveEditorFunctions[key]();
        resolveEditorFunctions[key] = undefined;
    });

    // Tests should fail when there is an error on the page
    page.on('pageerror', (error) => {
        throw new Error(`There was in error in the page: ${error.message}`);
    });

    // Tests should fail when there is a failed request to our server
    page.on('response', async (response) => {
        if (
            response.status() >= 400 &&
            response.status() < 600 &&
            // we ignore requests that result in errors on different servers
            response.url().startsWith(serverHost) &&
            // we ignore requests that result from missing resource files
            // in packages
            !/\/content\/(\d+)\/$/.test(response.url()) &&
            // we ignore missing favicons
            !/favicon\.ico$/.test(response.url())
        ) {
            throw new Error(
                `Received status code ${response.status()} ${response.statusText()} for ${response
                    .request()
                    .method()} request to ${response.url()}\n${await response.text()}`
            );
        }
    });
}

async function afterAll() {
    await page.close();
    await browser.close();
    resolveEditorFunctions = {};
}

async function uploadSave(file){
    await page.goto(`${serverHost}/h5p/new`, {
        waitUntil: ['load', 'networkidle0']
    });
    // The editor is displayed within an iframe, so we must get it
    await page.waitForSelector('iframe.h5p-editor-iframe');
    const contentFrame = await (
        await page.$('iframe.h5p-editor-iframe')
    ).contentFrame();

    // This code listens for a H5P event to detect when the editor has
    // fully loaded. Later, the test waits for editorLoadedPromise to
    // resolve.
    const editorLoadedPromise = new Promise((res) => {
        resolveEditorFunctions[file] = res;
    });

    // Inject the code to catch the editorloaded event.
    await page.evaluate((browserFile) => {
        window.H5P.externalDispatcher.on('editorloaded', () => {
            window.onEditorLoaded(browserFile);
        });
    }, file);
    await contentFrame.waitForSelector('#h5p-hub-upload');
    await contentFrame.focus('#h5p-hub-upload');
    await contentFrame.click('#h5p-hub-upload');
    await contentFrame.waitForSelector(".h5p-hub-input-wrapper input[type='file']");
    const uploadHandle = await contentFrame.$(
        ".h5p-hub-input-wrapper input[type='file']"
    );
    await uploadHandle.uploadFile(file);
    await contentFrame.waitForSelector('button.h5p-hub-use-button');
    await contentFrame.focus('button.h5p-hub-use-button');
    await contentFrame.click('button.h5p-hub-use-button');

    // Wait until the file was validated.
    if (!(await contentFrame.$('div.h5p-hub-info'))) {
        await contentFrame.waitForSelector('div.h5p-hub-info', {
            timeout: 60000 // increased timeout as validation can take ages
        });
    }
    // editorLoadedPromise resolves when the H5P editor signals that it
    // was fully loaded
    await editorLoadedPromise;

    // some content type editors still to some things after the
    // editorloaded event was sent, so we wait for an arbitrary time
    await page.waitForTimeout(500);

    // Press save and wait until the player has loaded
    await page.waitForSelector('#save-h5p');
    const navPromise = page.waitForNavigation({
        waitUntil: ['load', 'networkidle0'],
        timeout: 60000
    });
    await page.focus('#save-h5p');
    await page.click('#save-h5p');
    await navPromise;
}

module.exports = {
    beforeAll: beforeAll,
    afterAll: afterAll,
    uploadSave: uploadSave
}