const express = require('express');
const auth = require('../authentication')
const db = require("../config/database")
const getContentPermissions = require('../h5p/getContentPermissions')

module.exports = function (h5pEditor, h5pPlayer, languageOverride = 'auto') {
    const router = express.Router();

    //Gets and display/plays completed h5p component
    router.get(`${h5pEditor.config.playUrl}/:contentId`, auth.checkAuthenticated, async (req, res) => {
        try {
            if (!req.user.UserRole.includes('Admin')) {
                const permissions = await getContentPermissions(req.params.contentId, req.user.id)
                if (!permissions || !permissions.view) {
                    res.render("unauthorized.ejs")
                    return
                }
            }

            const h5pPage = await h5pPlayer.render(
                req.params.contentId,
                req.user,
                languageOverride === 'auto'
                    ? req.language ?? 'en'
                    : languageOverride,
                {
                    showCopyButton: true,
                    showDownloadButton: true,
                    showFrame: true,
                    showH5PIcon: true,
                    showLicenseButton: true
                }
            );
            res.send(h5pPage);
            res.status(200).end();
        } catch (error) {
            res.status(500).end(error.message);
        }
    })

    router.get('/edit/:contentId', auth.checkAuthenticated, async (req, res) => {
        if (!req.user.UserRole.includes('Admin')) {
            const permissions = await getContentPermissions(req.params.contentId, req.user.id)
            if (!permissions || !permissions.edit) {
                res.render("unauthorized.ejs")
                return
            }
        }

        const page = await h5pEditor.render(
            req.params.contentId,
            languageOverride === 'auto'
                ? req.language ?? 'en'
                : languageOverride,
            req.user
        );
        res.send(page);
        res.status(200).end();
    }
    );

    router.post('/edit/:contentId', auth.checkAuthenticated, async (req, res) => {
        if (!req.user.UserRole.includes('Admin')) {
            const permissions = await getContentPermissions(req.params.contentId, req.user.id)
            if (!permissions || !permissions.edit) {
                res.render("unauthorized.ejs")
                return
            }
        }
        const contentId = await h5pEditor.saveOrUpdateContent(
            req.params.contentId.toString(),
            req.body.params.params,
            req.body.params.metadata,
            req.body.library,
            req.user
        );

        res.send(JSON.stringify({ contentId }));
        res.status(200).end();
    });

    router.get('/new', auth.checkAuthenticated, async (req, res) => {
        const page = await h5pEditor.render(
            undefined,
            languageOverride === 'auto'
                ? req.language ?? 'en'
                : languageOverride,
            req.user
        );
        res.send(page);
        res.status(200).end();
    }
    );

    router.post('/new', auth.checkAuthenticated, async (req, res) => {
        if (
            !req.body.params ||
            !req.body.params.params ||
            !req.body.params.metadata ||
            !req.body.library ||
            !req.user
        ) {
            res.status(400).send('Malformed request').end();
            return;
        }

        try {
            const contentId = await h5pEditor.saveOrUpdateContent(
                undefined,
                req.body.params.params,
                req.body.params.metadata,
                req.body.library,
                req.user
            );

            await db.Content.create({
                data: {
                    id: `${contentId}`,
                    userId: req.user.id,
                    isOwner: true
                }
            })
            res.json(JSON.stringify({ contentId }));
            res.status(200).end();
        } catch (err) {
            res.status(500).end();
        }
    });

    router.get('/delete/:contentId', auth.checkAuthenticated, async (req, res) => {
        if (!req.user.UserRole.includes('Admin')) {
            const permissions = await getContentPermissions(req.params.contentId, req.user.id)
            if (!permissions || !permissions.delete) {
                res.render("unauthorized.ejs")
                return
            }
        }
        try {

            // Remove entry from database
            await db.Content.deleteMany({
                where: {
                    id: req.params.contentId,
                }
            })

            // Delete content file
            await h5pEditor.deleteContent(req.params.contentId, req.user);
            
        } catch (error) {
            req.flash("success", `Error deleting content with id ${req.params.contentId}`)
            res.redirect("/account/content")
            return;
        }
        req.flash("success", `Content ${req.params.contentId} successfully deleted`)
        res.redirect("/account/content")
    });

    return router;
}