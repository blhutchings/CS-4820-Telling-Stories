/**
 * Downloads a current list of content types from the H5P Hub. This list is stored in the repository for mocking up the real hub without calling it
 * too often. Run this script to update the content type cache mockup. Expect necessary changes in the tests if the hub content changes.
 */

const fsExtra = require('fs-extra')
const path = require('path')
const {ContentTypeCache, H5PConfig} = require('@lumieducation/h5p-server')


class InMemoryStorage  {
    storage;
    constructor() {
        this.storage = {};
    }
    async load(key) {
        return this.storage[key];
    }
    async save(key, value) {
        this.storage[key] = value;
    }
}


const start = async () => {
    const keyValueStorage = new InMemoryStorage();
    const config = new H5PConfig(keyValueStorage);
    config.uuid = '8de62c47-f335-42f6-909d-2d8f4b7fb7f5';

    const contentTypeCache = new ContentTypeCache(
        config,
        keyValueStorage
    );
    if (!(await contentTypeCache.forceUpdate())) {
        console.error('Could not download content type cache from H5P Hub.');
        return;
    }

    const contentTypes = await contentTypeCache.downloadContentTypesFromHub();
    await fsExtra.writeJSON(
        path.resolve('test/data/content-type-cache/real-content-types.json'),
        { contentTypes }
    );
    console.log(
        'Wrote current content type cache to test/content-type-cache/real-content-types.json'
    );
};

start();
