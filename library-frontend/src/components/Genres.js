import Select from "react-select";
const Genres = ({ genres, selectedGenre, setGenreToShow }) => {
  const options = genres.map((a) => {
    return { value: a, label: a };
  });

  return (
    <>
      <Select
        defaultValue={selectedGenre}
        onChange={setGenreToShow}
        options={options}
      />
    </>
  );
};
export default Genres;
