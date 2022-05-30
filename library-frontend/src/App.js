import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";

import Recommended from "./components/Recommended";
import { useSubscription, useApolloClient } from "@apollo/client";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";
const App = () => {
  const [page, setPage] = useState("books");
  const [token, setToken] = useState(null);
  const [me, setMe] = useState(null);
  const [notification, setNotification] = useState("");
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const { bookAdded } = subscriptionData.data;
      setNotification(
        `📒 New book was added: ${bookAdded.title} by ${bookAdded.author.name}`
      );
      setTimeout(() => {
        setNotification("");
      }, 2500);
      client.cache.updateQuery(
        { query: ALL_BOOKS },

        ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(bookAdded),
          };
        }
      );
    },
  });
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && me ? (
          <button onClick={() => setPage("add")}>add book {me.username}</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
        {me && (
          <button onClick={() => setPage("recommended")}>recommended</button>
        )}
      </div>
      <div>{notification}</div>
      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      {token ? (
        <NewBook show={page === "add"} />
      ) : (
        <Login show={page === "login"} setToken={setToken} setMe={setMe} />
      )}
      {me && (
        <Recommended
          favoriteGenres={me.favoriteGenre}
          show={page === "recommended"}
        />
      )}
    </div>
  );
};

export default App;
