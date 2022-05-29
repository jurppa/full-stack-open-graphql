const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const express = require("express");
const http = require("http");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = require("./schema");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { UserInputError, AuthenticationError } = require("apollo-server");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";
const MONGODB_URI = "mongodb://127.0.0.1:27017/librarydb";
console.log("connecting to mongodb", MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((error) => console.log(`${error.message} failed to connect to db`));

// Schema

// Resolvers
const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const authorToSearch = await Author.findOne({ name: args.author });

        let filteredBooks = await Book.find({
          author: authorToSearch.id,

          genre: { $in: [args.genre] },
        }).populate("author");

        return filteredBooks;
      }
      if (args.author) {
        const authorToSearch = await Author.findOne({ name: args.author });
        console.log(authorToSearch);
        if (authorToSearch) {
          return await Book.find({ author: authorToSearch.id }).populate(
            "author"
          );
        }
      }
      if (args.genre) {
        return Book.find({
          genres: { $in: [args.genre] },
        }).populate("author");
      }
      return await Book.find({}).populate("author");
    },
    allAuthors: async () => {
      const authors = await Author.find({});
      const books = await Book.find({}).populate("author");

      const authorsWithBookCount = authors.map((a) => {
        const count = books.filter(
          (book) => book.author.name === a.name
        ).length;

        return { name: a.name, id: a._id, born: a.born, bookCount: count };
      });
      return authorsWithBookCount;
    },

    me: async (root, args, context) => context.currentUser,
  },
  Mutation: {
    addBook: async (root, args, context) => {
      console.log("addbook: ", args);
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError("Not authenticated");
      }
      const authorExists = await Author.findOne({ name: args.author });
      const bookExists = await Book.findOne({ title: args.title });
      if (bookExists) {
        throw new UserInputError("Book already exists");
      }
      let newAuthor;
      if (!authorExists) {
        newAuthor = new Author({
          name: args.author,
          born: null,
        });
        try {
          await newAuthor.save();
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          });
        }
      }
      console.log(newAuthor);
      const bookToAdd = new Book({
        ...args,
        author: authorExists || newAuthor,
      });
      try {
        await bookToAdd.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }
      pubsub.publish("BOOK_ADDED", { bookAdded: bookToAdd });

      return bookToAdd;
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new AuthenticationError("Not authenticated");
      }
      let authorExists = await Author.findOne({ name: args.name });
      if (authorExists) {
        authorExists.born = args.setBornTo;
        try {
          await authorExists.save();
        } catch (error) {
          throw new UserInputError(error);
        }

        return authorExists;
      }
      return null;
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });
      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

// Create express server

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: "",
    }
  );
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.toLowerCase().startsWith("bearer ")) {
        const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: "/",
  });

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  );
};
start();
