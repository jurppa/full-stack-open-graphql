const { ApolloServer, gql } = require("apollo-server");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");

const MONGODB_URI = "mongodb://127.0.0.1:27017/";
console.log("connecting to", MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("connected to db"))
  .catch((error) => console.log(`${error.message} failed to connect to db`));

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

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
    author: String!
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
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      if (args.author && args.genre) {
        let filteredBooks = books.filter(
          (book) =>
            book.author === args.author &&
            book.genres.some((b) => b === args.genre)
        );

        return filteredBooks;
      }
      if (args.author) {
        return books.filter((book) => book.author === args.author);
      }
      if (args.genre) {
        return books.filter((a) => a.genres.some((b) => b === args.genre));
      }
      return books;
    },
    allAuthors: () => {
      const authorsWithBookCount = authors.map((a) => {
        const bookCount = books.filter((b) => b.author === a.name).length;
        return {
          name: a.name,
          bookCount: bookCount,
          born: a.born ?? null,
        };
      });
      return authorsWithBookCount;
    },
  },
  Mutation: {
    addBook: (root, args) => {
      const authorExists = authors.find((a) => a.name === args.author);

      if (!authorExists) {
        const newAuthor = {
          name: args.author,
          id: uuid(),
          born: null,
        };

        authors = authors.concat(newAuthor);
      }

      const bookToAdd = {
        ...args,
        id: uuid(),
      };

      books = books.concat(bookToAdd);
    },
    editAuthor: (root, args) => {
      const authorExists = authors.find((a) => a.name === args.name);
      if (authorExists) {
        const updatedAuthor = { ...authorExists, born: args.setBornTo };
        authors = authors.map((author) =>
          author.id === authorExists.id ? { author, ...updatedAuthor } : author
        );
        return updatedAuthor;
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
