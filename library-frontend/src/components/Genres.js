import Select from "react-select";
const Genres = ({ genreArray, setGenreToShow }) => {
  const options = genreArray.map((a) => {
    return { value: a, label: a };
  });

  return (
    <>
      <Select onChange={setGenreToShow} options={options} />
    </>
  );
};
export default Genres;
