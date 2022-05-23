const { ApolloServer, gql, UserInputError } = require("apollo-server");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const book = require("./models/book");
const author = require("./models/author");

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
  }
  type Mutation {
    addBook(
      author: String!
      title: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
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
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
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
  },
  Mutation: {
    addBook: async (root, args) => {
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
    editAuthor: async (root, args) => {
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
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
