import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Recommended = ({ favoriteGenres, show }) => {
  console.log(favoriteGenres);

  const results = useQuery(ALL_BOOKS, {
    variables: { genreToSearch: favoriteGenres },
    fetchPolicy: "no-cache",
  });

  console.log(results);
  if (!show || results.loading) return null;
  const recommendedBooks = results.data.allBooks;
  console.log(recommendedBooks);

  return (
    <div>
      <h2>recommended books for your favorite genre "{favoriteGenres}"</h2>

      <div>
        {recommendedBooks.map((a) => (
          <div key={a.title}>
            <p>
              <h2>{a.title}</h2>
              <div>by {a.author.name}</div>
              <span>published {a.published}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Recommended;
