const db = require("../src/config/database")
const navBar = fs.readFileSync(__dirname + '/partial/_navHeaderUserHub.ejs', 'utf-8')


module.exports = function render(editor) {
    return async (req, res) => {

        let content = [];
        try {
            if (req.user.UserRole.includes('Admin')) {
                const allContent = await db.Content.findMany()
                content = allContent.map(content => content.id)
            } else {
                const userContent = await db.Content.findMany({
                    where: {
                        userId: parseInt(req.user.id)
                    }
                })
                content = userContent.filter(content => content.view).map(content => content.id)
            }
            const contentObjects = (await Promise.all(
                content.map(async (id) => {
                    try {
                        return {
                            id: id,
                            content: await editor.contentManager.getContentMetadata(id),
                        }
                    } catch (err) {
                        return {
                            id: id,
                            content: {
                                title: "Not Available",
                                mainLibrary: "Not Available",
                                id: id
                            }
                        }
                    }
                })
            )).filter(contentObject => contentObject !== undefined)
                .filter(contentObject => "content" in contentObject)

            res.send(`
        <!doctype html>
        <html>
        <head>
            <title>My Content</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" type="image/x-icon" href="/public/img/favicon.ico">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            <link rel="stylesheet" href="/public/css/main.css">
            
            <script src="/node_modules/requirejs/require.js"></script>
            <link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.min.css">
            <link rel="stylesheet" href="/node_modules/@fortawesome/fontawesome-free/css/all.min.css">
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

                            `<div class="list-group-item" style="border-radius:15px; box-shadow: rgba(99,99,99,0.2) 0px 2px 8px 0px; margin-top: 0.5rem">
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
         <script src="../public/menu-toggle-transition.js"></script>
        </body>
        `);
        } catch (err) {
            res.status(500).send(err)
        }
    };
}
