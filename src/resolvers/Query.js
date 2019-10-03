import getUserId from '../utils/getUserId'

const Query = {
    //usuarios paginados y ordenados 
    users(parent, args, { prisma }, info) {
        const opArgs = {
            first: args.first,
            skip: args.skip,
            after: args.after,
            orderBy: args.orderBy
        }
        //usuarios que se usa una query en el nombre usuario
        if (args.query) {
            opArgs.where = {
                OR: [{
                    name_contains: args.query
                }]
            }
        }

        return prisma.query.users(opArgs, info)
    },
    //el usuario que esta logueado utils/getUserId sale el userID
    me(parent, args, { prisma, request }, info) {
        // se llama al metodo para extraer del token el userId
        const userId = getUserId(request)
        
        return prisma.query.user({
            where: {
                id: userId
            }
        })
    }
}

export { Query as default }