import React from "react";
import { useRegisterMutation, CurrentUserDocument } from "./generated/graphql";

const PasswordSignUp = () => {
  const [user, setUser] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [signUp] = useRegisterMutation({
    update: (cache, { data: { register } }) => {
      cache.writeQuery({
        query: CurrentUserDocument,
        data: { currentUser: register },
      });
    },
  });
  console.log(user);
  return (
    // Sign up with credentials
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signUp({
          variables: {
            email: user.email,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
      }}
    >
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={user.firstName}
        onChange={(e) => setUser({ ...user, firstName: e.target.value })}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={user.lastName}
        onChange={(e) => setUser({ ...user, lastName: e.target.value })}
      />
      <input
        type="text"
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <button
        type="submit"
        onSubmit={(e) => {
          e.preventDefault();
          signUp({
            variables: {
              email: user.email,
              password: user.password,
              firstName: user.firstName,
              lastName: user.lastName,
            },
          });
        }}
      >
        Sign Up
      </button>
    </form>
  );
};

export default PasswordSignUp;
