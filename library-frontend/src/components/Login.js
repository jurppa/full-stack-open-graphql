import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN } from "../queries";

//

const Login = ({ show, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
    },
  });

  const handleLogin = async () => {
    try {
      const result = await await login({ variables: { username, password } });
      const token = result.data.login.value;
      setToken(token);
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
