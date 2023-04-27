import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/actions/userActions";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("sean94@gmail.com");
  const [password, setPassword] = useState("Seancal123");
  const dispatch = useDispatch();

  const history = useHistory();
  const isLoggedIn = useSelector((state) => state.user.loggedIn);

  useEffect(() => {
    if (isLoggedIn) {
      history.push("/");
    }
  }, [history, isLoggedIn]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(loginUser(userData));
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
