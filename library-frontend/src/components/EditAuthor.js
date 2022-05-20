import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import Select from "react-select";
//

const EditAuthor = ({ authors }) => {
  const options = authors.map((a) => {
    return { value: a.name, label: a.name };
  });
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [born, setBorn] = useState(null);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error);
    },
  });
  const handleEditBirthYear = () => {
    editAuthor({
      variables: { name: selectedAuthor.value, setBornTo: born },
    });
    setBorn(null);
  };

  return (
    <>
      <Select
        defaultValue={selectedAuthor}
        onChange={setSelectedAuthor}
        options={options}
      />
      <div>
        born
        <input
          type="number"
          value={born}
          onChange={({ target }) => setBorn(target.valueAsNumber)}
        />
      </div>
      <button onClick={() => handleEditBirthYear()}>update author</button>
    </>
  );
};
export default EditAuthor;
