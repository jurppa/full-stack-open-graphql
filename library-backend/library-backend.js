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
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        let filteredBooks = Book.collection.find({
          author: args.author,
          genre: args.genre,
        });

        return filteredBooks;
      }
      if (args.author) {
        const authorToSearch = Book.findOne({ author: args.author });
        if (authorToSearch) {
          return await Book.find({ author: authorToSearch.name }).populate(
            "author"
          );
        }
      }
      if (args.genre) {
        return Book.find((a) => a.genres.some((b) => b === args.genre));
      }
      return await Book.find({});
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
      if (!authorExists) {
        const newAuthor = new Author({
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
      console.log("author: ", args.author);
      const bookToAdd = new Book({
        ...args,
        author: authorExists ? authorExists.name : args.author,
      });
      console.log(bookToAdd);
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
