const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");

const User = require("./models/user");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";
const MONGODB_URI = "mongodb://127.0.0.1:27017/librarydb";
console.log("connecting to", MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(`${error.message} failed to connect to db`));

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 */

const typeDefs = gql`
  type Author {
    name: String!
    bookCount: Int
    born: Int
    id: ID!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]
    id: ID!
  }
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]

    allAuthors: [Author!]
    me: User
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const authorToSearch = await Author.findOne({ name: args.author });
        //

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
    allAuthors: async () => await Author.find({}),
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
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
