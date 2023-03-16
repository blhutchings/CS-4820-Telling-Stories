const H5P = require('@lumieducation/h5p-server')
const navBar = fs.readFileSync(__dirname + '/partial/_navHeaderUserHub.ejs',  'utf-8')

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
        console.log(contentObjects)
        res.send(`
        <!doctype html>
        <html>

        
        <head>
            <meta charset="utf-8">
            <script src="/node_modules/requirejs/require.js"></script>
            <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.min.css">
            <link rel="stylesheet" href="/node_modules/@fortawesome/fontawesome-free/css/all.min.css">
            <link rel="stylesheet" href="/public/css/main.css">
            <title>H5P NodeJs Demo</title>
        </head>
        <body>
        ${navBar}

        
        <div class="page__container">
            <div class="content__container" style="padding-top: 6rem;">
                <h2>
                    <span class="fa fa-file"></span> My content</h2>
                <a class="btn btn-primary my-2" style="border-radius: 50px;" href="${editor.config.baseUrl
            }/new"><span class="fa fa-plus-circle m-2"></span>Create new content</a>
                <div class="list-group" style="padding-top:1rem">
                ${contentObjects
                .map(
                    (content) =>

                        `<div class="list-group-item" style="border-radius:5px; box-shadow: 0px 2px black; margin-top: 0.5rem">
                                <div class="d-flex w-10">
                                    <div class="me-auto p-2 align-self-center">
                                        <a href="${editor.config.baseUrl}${editor.config.playUrl}/${content.id}">
                                            <h5>${content.content.title}</h5>
                                        </a>
                                        <hr/>
                                        <div class="small d-flex">                                            
                                            <div class="me-2">
                                                <span class="fa fa-book-open"></span>
                                                ${content.content.mainLibrary}
                                            </div>
                                            <div class="me-2">
                                                <span class="fa fa-fingerprint"></span>
                                                ${content.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-2">                                        
                                        <a class="btn btn-outline-secondary" style="border-radius:20px;"href="${editor.config.baseUrl}/edit/${content.id}">
                                            <span class="fa fa-pencil-alt m-1"></span>
                                            edit
                                        </a>
                                    </div>
                                    <div class="p-2">
                                        <a class="btn btn-outline-primary" style="border-radius:20px;"href="${editor.config.baseUrl}${editor.config.downloadUrl}/${content.id}">
                                            <span class="fa fa-file-download m-1"></span>
                                            download
                                        </a>
                                    </div>
                                    <div class="p-2">
                                        <a class="btn btn-outline-danger" style="border-radius:20px;" href="${editor.config.baseUrl}/delete/${content.id}">
                                            <span class="fa fa-trash-alt m-1"></span>
                                            delete
                                        </a>
                                    </div>
                                </div>                                
                            </div>`
                )
                .join('')}
                </div>
                <hr/>
            </div>
         </div>
        </body>
        `);
    };
}
