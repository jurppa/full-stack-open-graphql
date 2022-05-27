import { useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS } from "../queries";
import Genres from "./Genres";

//

const Books = (props) => {
  const results = useQuery(ALL_BOOKS);

  const [genreToShow, setGenreToShow] = useState("");
  console.log("results: ", results);
  if (!props.show || results.loading) {
    return null;
  }

  const books = results.data.allBooks;
  let genreArray = [];
  books.forEach((a) => genreArray.push(...a.genres));
  const booksToShow =
    genreToShow && genreToShow.value !== "all"
      ? books.filter((a) => a.genres.includes(genreToShow.value))
      : books;

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Genres genreArray={genreArray} setGenreToShow={setGenreToShow} />
    </div>
  );
};

export default Books;
