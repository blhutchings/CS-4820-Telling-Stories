const H5P = require('@lumieducation/h5p-server')

module.exports = function render(editor) {
    return async (req, res) => {
        console.log(req.user);
        const contentIds = await editor.contentManager.listContent();
        const contentObjects = await Promise.all(
            contentIds.map(async (id) => ({
                content: await editor.contentManager.getContentMetadata(
                    id,
                    req.user
                ),
                id
            }))
        );
        console.log(contentObjects);
        res.json(contentObjects);
    };
}