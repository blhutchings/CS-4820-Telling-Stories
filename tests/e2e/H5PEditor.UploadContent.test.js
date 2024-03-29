const fs = require('fs-extra');
const path = require('path');

const uploadHelpers = require('./helpers/upload');

const examplesPath = path.resolve('test/data/hub-content');
const host = 'http://localhost:8080';

describe('e2e test: upload content and save', () => {
    beforeAll(async () => {
        await uploadHelpers.beforeAll(host);
    });

    afterAll(async () => {
        await uploadHelpers.afterAll();
    });

    for (const file of fs
        .readdirSync(examplesPath)
        // We ignore H5P.Audio as the requests for the OGG file is never
        // resolved in some cases See #553 for more details.
        .filter((f) => f !== 'H5P.Audio.h5p')) {
        it(`uploading and then saving ${file}`, async () => {
            await uploadHelpers.uploadSave(path.join(examplesPath, file));
        }, 60000);
    }
    it('temp', () => {
        expect('this').toBe('this')
    });
});
