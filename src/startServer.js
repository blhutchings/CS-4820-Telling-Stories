const server = require("../src/server");

/**
 * start server
 */
const PORT = 8080
server.listen(PORT)
console.log(`Server started on port http://localhost:${PORT}...`)