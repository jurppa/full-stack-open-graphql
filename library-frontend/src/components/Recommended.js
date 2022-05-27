import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Recommended = ({ favoriteGenres, show }) => {
  console.log(favoriteGenres);

  const results = useQuery(ALL_BOOKS, {
    variables: favoriteGenres,
    skip: !favoriteGenres,
    update: (cache, response) => {},
  });

  const recommendedBooks = results.data.allBooks;
  console.log(recommendedBooks);
  if (!show) return null;

  return (
    <div>
      <h2>recommended books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Recommended;
