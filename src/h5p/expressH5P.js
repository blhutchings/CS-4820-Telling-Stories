const express = require('express')
const H5P = require('@lumieducation/h5p-server')
const { h5pAjaxExpressRouter,
    libraryAdministrationExpressRouter,
    contentTypeCacheExpressRouter } = require('@lumieducation/h5p-express')

const fileUpload = require('express-fileupload')
const path = require('path')

const i18next = require('i18next')
const i18nextFsBackend = require('i18next-fs-backend')
const i18nextHttpMiddleware = require('i18next-http-middleware')

const User = require('../DefaultUser.js')
const h5pContentRoutes = require('../routes/h5pContentRoutes');
const h5pRoutes = require('../routes/h5pRoutes.js')
const createH5PEditor = require('./createH5PEditor.js')

const contentCreatePage = require('../../views/contentCreate.js')
const playerPage = require('../../views/player.js')
const contentPageRenderer = require('../../views/contentPageRenderer.js')

const auth = require('../authenticate')

let tmpDir;
module.exports = async (server) => {
    const useTempUploads = process.env.TEMP_UPLOADS === 'true';
    if (useTempUploads) {
        tmpDir = await dir({ keep: false, unsafeCleanup: true });
    }

    // We use i18next to localize messages sent to the user. You can use any
    // localization library you like.
    const translationFunction = await i18next
        .use(i18nextFsBackend)
        .use(i18nextHttpMiddleware.LanguageDetector) // This will add the
        // properties language and languages to the req object. See
        // https://github.com/i18next/i18next-http-middleware#adding-own-detection-functionality
        // how to detect language in your own fashion. You can also choose not
        // to add a detector if you only want to use one language.
        .init({
            backend: {
                loadPath: path.join(
                    __dirname,
                    '../../node_modules/@lumieducation/h5p-server/build/assets/translations/{{ns}}/{{lng}}.json'
                )
            },
            debug: process.env.DEBUG && process.env.DEBUG.includes('i18n'),
            defaultNS: 'server',
            fallbackLng: 'en',
            ns: [
                'client',
                'copyright-semantics',
                'hub',
                'library-metadata',
                'metadata-semantics',
                'mongo-s3-content-storage',
                's3-temporary-storage',
                'server',
                'storage-file-implementations'
            ],
            preload: ['en', 'de'] // If you don't use a language detector of
            // i18next, you must preload all languages you want to use!
        });

    // Load the configuration file from the local file system
    const config = await new H5P.H5PConfig(
        new H5P.fsImplementations.JsonStorage(
            path.join(__dirname, '../../config.json')
        )
    ).load();

    // The H5PEditor object is central to all operations of h5p-nodejs-library
    // if you want to user the editor component.
    //
    // To create the H5PEditor object, we call a helper function, which
    // uses implementations of the storage classes with a local filesystem
    // or a MongoDB/S3 backend, depending on the configuration values set
    // in the environment variables.
    // In your implementation, you will probably instantiate H5PEditor by
    // calling new H5P.H5PEditor(...) or by using the convenience function
    // H5P.fs(...).
    const h5pEditor = await createH5PEditor(
        config,
        path.join(__dirname, '../../h5p/libraries'), // the path on the local disc where
        // libraries should be stored)
        path.join(__dirname, '../../h5p/content'), // the path on the local disc where content
        // is stored. Only used / necessary if you use the local filesystem
        // content storage class.
        path.join(__dirname, '../../h5p/temporary-storage'), // the path on the local disc
        // where temporary files (uploads) should be stored. Only used /
        // necessary if you use the local filesystem temporary storage class.,
        path.join(__dirname, '../../h5p/user-data'),
        (key, language) => translationFunction(key, { lng: language })
    );

    // The H5PPlayer object is used to display H5P content.
    const h5pPlayer = new H5P.H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config,
        undefined,
        undefined,
        (key, language) => translationFunction(key, { lng: language }),
        undefined,
        h5pEditor.contentUserDataStorage
    );

    server.get('/account/homepage',auth.checkAuthenticated, contentPageRenderer(h5pEditor));
    server.get('/contentRoute', h5pContentRoutes(h5pEditor));
    // Custom page to render Hub and display content
    h5pPlayer.setRenderer(playerPage)
    h5pEditor.setRenderer(contentCreatePage)


    /**
    // Required but use'd in main server.js
    server.use(bodyParser.json({ limit: '500mb' }));
    server.use(
        bodyParser.urlencoded({
            extended: true
        })
    );
    */

    // Configure file uploads
    server.use(
        fileUpload({
            limits: { fileSize: h5pEditor.config.maxTotalSize },
            useTempFiles: useTempUploads,
            tempFileDir: useTempUploads ? tmpDir?.path : undefined
        })
    );

    // delete temporary files left over from uploads
    if (useTempUploads) {
        server.use((req, res, next) => {
            res.on('finish', async () => clearTempFiles(req));
            next();
        });
    }

    // It is important that you inject a user object into the request object!
    // The Express adapter below (H5P.adapters.express) expects the user
    // object to be present in requests.
    // In your real implementation you would create the object using sessions,
    // JSON webtokens or some other means.
    server.use((req, res, next) => {
        req.user = new User();
        next();
    });

    // The i18nextExpressMiddleware injects the function t(...) into the req
    // object. This function must be there for the Express adapter
    // (H5P.adapters.express) to function properly.
    server.use(i18nextHttpMiddleware.handle(i18next));

    // The Express adapter handles GET and POST requests to various H5P
    // endpoints. You can add an options object as a last parameter to configure
    // which endpoints you want to use. In this case we don't pass an options
    // object, which means we get all of them.
    server.use(
        h5pEditor.config.baseUrl,
        h5pAjaxExpressRouter(
            h5pEditor,
            path.resolve(path.join(__dirname, '../../h5p/core')), // the path on the local disc where the
            // files of the JavaScript client of the player are stored
            path.resolve(path.join(__dirname, '../../h5p/editor')), // the path on the local disc where the
            // files of the JavaScript client of the editor are stored
            undefined,
            'auto' // You can change the language of the editor here by setting
            // the language code you need here. 'auto' means the route will try
            // to use the language detected by the i18next language detector.
        )
    );

    // The expressRoutes are routes that create pages for these actions:
    // - Creating new content
    // - Editing content
    // - Saving content
    // - Deleting content
    server.use(
        h5pEditor.config.baseUrl,
        h5pRoutes(
            h5pEditor,
            h5pPlayer,
            'auto' // You can change the language of the editor by setting
            // the language code you need here. 'auto' means the route will try
            // to use the language detected by the i18next language detector.
        ),
        h5pContentRoutes(
          h5pEditor,
          h5pPlayer,
          'auto'
    ),
    );

    // The LibraryAdministrationExpress routes are REST endpoints that offer
    // library management functionality.
    server.use(
        `${h5pEditor.config.baseUrl}/libraries`,
        libraryAdministrationExpressRouter(h5pEditor)
    );

    // The ContentTypeCacheExpress routes are REST endpoints that allow updating
    // the content type cache manually.
    server.use(
        `${h5pEditor.config.baseUrl}/content-type-cache`,
        contentTypeCacheExpressRouter(h5pEditor.contentTypeCache)
    );


    // We only include the whole node_modules directory for convenience. Don't
    // do this in a production app.
    server.use(
        '/node_modules',
        express.static(path.join(__dirname, '../../node_modules'))
    );

    // Remove temporary directory on shutdown
    if (useTempUploads) {
        [
            'beforeExit',
            'uncaughtException',
            'unhandledRejection',
            'SIGQUIT',
            'SIGABRT',
            'SIGSEGV',
            'SIGTERM'
        ].forEach((evt) =>
            process.on(evt, async () => {
                await tmpDir?.cleanup();
                tmpDir = null;
            })
        );
    }
};

