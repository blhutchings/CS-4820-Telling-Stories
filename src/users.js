const express = require("express")
const router = express.Router()

router.get('/', auth.checkAuthenticated, async(req, res) => { //remember, /users is appended at the begining of this route, even though it is written as /
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * PAGE_SIZE
    const limit = PAGE_SIZE

    const count = await db.user.count()
    const totalPages = Math.ceil(count / PAGE_SIZE)

    try {
        const user = await db.User.findFirst({
            where: { id: req.user.id },
            include: { role: true },
        })

        //console.log(user)

        if (!user || user.role[0].role !== "Admin") {
            // req.flash("error", "You do not have access to view users.")
            res.render("unauthorized.ejs")
            return
        }


        const users = await db.user.findMany({
            skip: skip,
            take: limit,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });

        console.log("users length is " + count)
        res.render("users.ejs", { users, page, totalPages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post('/:id/delete', async(req, res) => { // this would be users/:id/delete
    const userId = parseInt(req.params.id);
    console.log(userId)
    try {
        // Find the user by ID
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Delete the user
        await db.user.delete({
            where: {
                id: userId,
            },
        });

        // Redirect to the list of users
        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.get('/:id/edit', async(req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            include: {
                role: true
            }
        });
        console.log(user)
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('edit-user', {
            user: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});

router.post('/:id/edit', async(req, res) => {
    const { firstName, lastName, email, role } = req.body;
    const userId = parseInt(req.params.id);

    try {
        const updatedUser = await db.user.update({
            where: {
                id: userId
            },
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email
            }
        });
        const updatedUserRole = await db.userRole.update({
            where: {
                id: userId
            },
            data: {
                role: role,
            },
        });

        req.flash('success', 'User updated successfully!');
        res.redirect('/users');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update user.');
        res.redirect('/users');
    }
});



module.exports = router