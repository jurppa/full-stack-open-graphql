const Login = ({ show }) => {
  if (!show) {
    return null;
  }
  return (
    <div>
      <div>
        username <input type="text" />
      </div>
      <div>
        password
        <input type="password" />
      </div>
    </div>
  );
};
export default Login;
