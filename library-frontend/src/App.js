import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";

const App = () => {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(null);
  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <button onClick={() => setPage("add")}>add book</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      {token ? (
        <NewBook show={page === "add"} />
      ) : (
        <Login show={page === "login"} setToken={setToken} />
      )}
    </div>
  );
};

export default App;
