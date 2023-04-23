const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


// Required middelware to convert userId from a session into int
prisma.$use(async (params, next) => {
    if (params.model == 'Content' && params.action == 'find') {
        if (params.args?.where?.userId) {
            params.args.where.userId = parseInt(params.args.where.userId)
        }
    } else if (params.model == 'Content' && params.action == 'create') {
        params.args.data.userId = parseInt(params.args.data.userId)
    }
    // Manipulate params here
    const result = await next(params)
    // See results here
    return result
})

module.exports = prisma