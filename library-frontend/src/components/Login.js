import { useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import { LOGIN } from "../queries";

//

const Login = ({ show, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("libraryDb", token);
    }
  }, [result.data]); // eslint-disable-line
  const handleLogin = async () => {
    try {
      const result = await login({ variables: { username, password } });
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("libraryToken", token);
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  if (!show) {
    return null;
  }
  return (
    <div>
      <div>
        username{" "}
        <input
          type="text"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};
export default Login;
