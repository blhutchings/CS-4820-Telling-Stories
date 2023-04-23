const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


// Required middelware to convert userId from a session into int
prisma.$use(async (params, next) => {
    if (params.model == 'Content') {
        if (params.args?.where?.userId) {
            params.args.where.userId = parseInt(params.args.where.userId)
        }
    }
    // Manipulate params here
    const result = await next(params)
    // See results here
    return result
})

module.exports = prisma