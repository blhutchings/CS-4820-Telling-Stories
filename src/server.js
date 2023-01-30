import express from "express";
import fileUpload from 'express-fileupload';
import path from 'path';
import { h5pAjaxExpressRouter } from '@lumieducation/h5p-express'

async function main() {


    // Load the configuration file from the local file system
    const config = await new H5P.H5PConfig(
        new H5P.fsImplementations.JsonStorage(
            path.join(__dirname, '../config.json')
        )
    ).load();

    const h5pEditor = await createH5PEditor(
        config,
        path.join(__dirname, '../h5p/libraries'), // the path on the local disc where
        // libraries should be stored)
        path.join(__dirname, '../h5p/content'), // the path on the local disc where content
        // is stored. Only used / necessary if you use the local filesystem
        // content storage class.
        path.join(__dirname, '../h5p/temporary-storage'), // the path on the local disc
        // where temporary files (uploads) should be stored. Only used /
        // necessary if you use the local filesystem temporary storage class.,
        path.join(__dirname, '../h5p/user-data')
    )

    // The H5PPlayer object is used to display H5P content.
    const h5pPlayer = new H5P.H5PPlayer(
        h5pEditor.libraryStorage,
        h5pEditor.contentStorage,
        config,
        undefined,
        undefined,
        undefined,
        undefined,
        h5pEditor.contentUserDataStorage
    );

    const PORT = 8080
    const server = express();

    server.use(bodyParser.json({ limit: '500mb' }));
    server.use(
        bodyParser.urlencoded({
            extended: true
        })
    );


    // Configure file uploads
    server.use(
        fileUpload({
            limits: { fileSize: h5pEditor.config.maxTotalSize },
        })
    );

    // It is important that you inject a user object into the request object!
    // The Express adapter below (H5P.adapters.express) expects the user
    // object to be present in requests.
    // In your real implementation you would create the object using sessions,
    // JSON webtokens or some other means.
    server.use((req, res, next) => {
        req.user = new User();
        next();
    });

    // The Express adapter handles GET and POST requests to various H5P
    // endpoints. You can add an options object as a last parameter to configure
    // which endpoints you want to use. In this case we don't pass an options
    // object, which means we get all of them.
    server.use(
        h5pEditor.config.baseUrl,
        h5pAjaxExpressRouter(
            h5pEditor,
            path.resolve(path.join(__dirname, '../h5p/core')), // the path on the local disc where the
            // files of the JavaScript client of the player are stored
            path.resolve(path.join(__dirname, '../h5p/editor')), // the path on the local disc where the
            // files of the JavaScript client of the editor are stored
            undefined,
            'en' // You can change the language of the editor here by setting
            // the language code you need here. 'auto' means the route will try
            // to use the language detected by the i18next language detector.
        )
    );



    server.listen(PORT, function () {
        console.log(`Server started on port ${PORT}...`)
    })
}

main();
