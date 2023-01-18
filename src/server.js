import express from "express";

async function main() {
    const server = express();

    const PORT = 8080

    server.listen(PORT, function () {
        console.log(`Server started on port ${PORT}...`)
    })
}

main();
