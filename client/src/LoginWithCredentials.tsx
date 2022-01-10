import React, { useState } from "react";
import {
  useLoginMutation,
  CurrentUserQueryDocument,
} from "./generated/graphql";

const LoginWithCredentials = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [login] = useLoginMutation({
    update: (cache, { data: { login } }) =>
      cache.writeQuery({
        query: CurrentUserQueryDocument,
        data: { currentUser: login },
      }),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        login({
          variables: {
            email: user.email,
            password: user.password,
          },
        });
      }}
    >
      <input
        type="text"
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
      />
      <input
        type="text"
        name="password"
        placeholder="Password"
        value={user.password}
        onChange={(e) => setUser({ ...user, password: e.target.value })}
      />
      <button type="submit">Login</button>
    </form>
  );
};
export default LoginWithCredentials;
