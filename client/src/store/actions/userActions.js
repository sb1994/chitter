import axios from "axios";
import setAuthToken from "../../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import {
  SET_CURRENT_USER,
  REGISTER_USER,
  LOGIN_USER,
  LOGOUT_USER,
} from "../action_types";

// Register User
export const registerUser = (userData) => async (dispatch) => {
  try {
    const res = await axios.post("/api/users/register", userData);
    dispatch({
      type: REGISTER_USER,
      payload: res.data,
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

// Login - get user token
export const loginUser = (userData) => async (dispatch) => {
  try {
    // console.log(userData);
    const res = await axios.post("/api/users/login", userData);
    // Save token to local storage
    console.log(res);
    const { token } = res.data;
    localStorage.setItem("token", token);
    // Set token to Auth header
    setAuthToken(token);
    // Decode token to get user data
    const decoded = jwt_decode(token);
    console.log(decoded);
    // Set current user
    dispatch(setCurrentUser(decoded));
    dispatch({
      type: LOGIN_USER,
      payload: decoded,
    });
  } catch (err) {
    return Promise.reject(err);
  }
};

// Set logged in user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// Log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object, which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
  dispatch({
    type: LOGOUT_USER,
  });
};

export const loadUser = () => async (dispatch) => {
  // Set the token header
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get("/api/auth");

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({ type: AUTH_ERROR });
  }
};
