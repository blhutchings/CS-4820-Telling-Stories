import express from "express";
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import expressH5P from "./h5p/expressH5P.js";



async function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);


    const PORT = 8080; // Tests won't work unless 8080
    const server = express();

    server.use(bodyParser.json({ limit: '500mb' }));
    server.use(bodyParser.urlencoded({extended: true}));

    expressH5P(server);
    
    server.get('/', (req, res) => {
        res.status(200).end();
      })

    server.listen(PORT, function () {
        console.log(`Server started on port ${PORT}...`)
    })
}

main();
