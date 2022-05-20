import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const EditAuthor = () => {
  const [name, setName] = useState("");

  const [born, setBorn] = useState(null);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error);
    },
  });
  const handleEditBirthYear = () => {
    editAuthor({ variables: { name: name, setBornTo: born } });
    setName("");
    setBorn(null);
  };
  return (
    <>
      <div>
        name
        <input
          type="text"
          value={name}
          onChange={({ target }) => setName(target.value)}
        />
      </div>
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
