const { User } = require('../models')
const { signToken } = require('../utils/auth')
const { AuthenticationError } = require('apollo-server-express')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user_id})
                return userData
            }
        }

    },
    Mutation: {
        addUser: async (parent, args) => {
            try {
                const user = await User.create(args)

                const token = signToken(user)
                return {token, user}
            } catch (err) {
                console.log(err)
            }
        },
        login: async (parent, {email, password}) => {
            const user = await User.findOne({ email })

            if (!user) {
                throw new AuthenticationError('information incorrect')
            }
            const correctPW = await User.isCorrectPassword(password)

            if (!correctPW) {
                throw new AuthenticationError('password incorrect')
            }
            const token = signToken(user)
            return { token, user }
        }
    },
    saveBook: async (paret, args, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
                {_id: context.user._id },
                { $addToSet: {savedBooks: args.input } },
                { new: true, runValidators: true }
            )
        }
    }
}

export default resolvers