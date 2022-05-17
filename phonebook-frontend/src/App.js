import { useQuery } from "@apollo/client";
import { useState } from "react";
import Notify from "./Components/Notify";
import PersonForm from "./Components/PersonForm";
import Persons from "./Components/Persons";
import PhoneForm from "./Components/PhoneForm";
import { ALL_PERSONS } from "./queries";

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const result = useQuery(ALL_PERSONS, {
    pollInterval: 2000,
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  const notify = (message) => {
    console.log("message");
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };
  return (
    <div>
      <Notify errorMessage={errorMessage} />

      <Persons persons={result.data.allPersons} />

      <PersonForm setError={notify} />
      <PhoneForm setError={notify} />
    </div>
  );
};

export default App;
