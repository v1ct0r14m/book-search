const express = require('express')
const path = require('path')
const { ApolloServer } = require('apollo-server-express')
const { typeDefs, resolvers } = require('./s')
const db = require('./config/connection')
const routes = require('./routes')
const { authMiddleware } = require('./utils/auth')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(routes)


const PORT = process.env.PORT || 3001
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})


if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')))
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
})

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start()
  server.applyMiddleware({app})

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`))
  })
}

startApolloServer(typeDefs, resolvers)
