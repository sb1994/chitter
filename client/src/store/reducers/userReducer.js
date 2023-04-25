const initialState = {
  user: null,
  buddies: [],
  loggedIn: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        buddies: action.payload.buddies,
        loggedIn: true,
      };
    case "LOGOUT_SUCCESS":
      return {
        ...state,
        user: null,
        buddies: [],
        loggedIn: false,
      };
    case "ADD_BUDDY_SUCCESS":
      return {
        ...state,
        buddies: [...state.buddies, action.payload],
      };
    case "REMOVE_BUDDY_SUCCESS":
      return {
        ...state,
        buddies: state.buddies.filter((buddy) => buddy._id !== action.payload),
      };
    default:
      return state;
  }
};

export default userReducer;
