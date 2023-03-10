const fs = require('fs-extra');
const path = require('path');
const error =require("console");
const uploadHelpers = require('./helpers/upload');

const problemCasesPath = path.resolve('test/data/problem-cases');
const host = 'http://localhost:8080';

describe('e2e test: upload content and save', () => {
    beforeAll(async () => {
        await uploadHelpers.beforeAll(host);
    });

    afterAll(async () => {
        await uploadHelpers.afterAll();
    });

    for (const file of fs
        .readdirSync(problemCasesPath)
        .filter((f) => f.endsWith('.h5p'))) {
        error.error(file);
        it(`uploading and then saving ${file}`, async () => {
            await uploadHelpers.uploadSave(path.join(problemCasesPath, file));
        }, 60000);
    }
});
