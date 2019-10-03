import bcrypt from 'bcryptjs'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'

const Mutation = {
    async createUser(parent, args, { prisma }, info) {
        // /utils/hashPassword llamar al metodo hashpassword para crearla
        const password = await hashPassword(args.data.password)
        //usar el metodo createUser de prima para crear el usuario
        const user = await prisma.mutation.createUser({
            data: {
                //enviamos los argumentos y el password generado
                ...args.data,
                password
            }
        })
        //devuelve token y usuario
        return {
            user,
            token: generateToken(user.id)
        }
    },
    async login(parent, args, { prisma }, info) {
        //mira si esta el mail en la peticion de login
        const user = await prisma.query.user({
            where: {
                email: args.data.email
            }
        })

        if (!user) {
            throw new Error('Unable to login')
        }
        //comparar la contraseña hasheada con la almacenada
        const isMatch = await bcrypt.compare(args.data.password, user.password)
        // sino coincide, error
        if (!isMatch) {
            throw new Error('Unable to login')
        }
        // si coincide devolvemos usuario y token
        return {
            user,
            token: generateToken(user.id)
        }
    },
    async deleteUser(parent, args, { prisma, request }, info) {
        //usamos el metodo getuserId
        const userId = getUserId(request)
        // metodo prisma deleteUser where id: userId
        return prisma.mutation.deleteUser({
            where: {
                id: userId
            }
        }, info)
    },
    async updateUser(parent, args, { prisma, request }, info) {
        //usamos el metodo getuserId
        const userId = getUserId(request)

        if (typeof args.data.password === 'string') {
            //hasear el nuevo password
            args.data.password = await hashPassword(args.data.password)
        }

        return prisma.mutation.updateUser({
            where: {
                id: userId
            },
            data: args.data
        }, info)
    }
}

export { Mutation as default }