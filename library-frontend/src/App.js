import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";

import Recommended from "./components/Recommended";
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from "@apollo/client";
import { BOOK_ADDED } from "./queries";
const App = () => {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);
  const [me, setMe] = useState(null);
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      alert(subscriptionData.data.title);
    },
  });
  console.log(me);
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <button onClick={() => setPage("add")}>add book {me.username}</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
        {me && (
          <button onClick={() => setPage("recommended")}>recommended</button>
        )}
      </div>

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
