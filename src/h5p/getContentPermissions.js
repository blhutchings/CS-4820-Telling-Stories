const db = require("../config/database")

module.exports = function getContentPermissions(contentId, userId) {
    return db.Content.findUnique({
        where: {
            id_userId: {
                id: contentId,
                userId: userId
            }
        }
    })
}