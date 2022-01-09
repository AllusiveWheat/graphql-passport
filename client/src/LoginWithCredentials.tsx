import React from "react";
import {
  useLoginMutation,
  CurrentUserQueryDocument,
} from "./generated/graphql";

const user = {
  email: "maurice@moss.com",
  password: "abcdefg",
};
const LoginWithCredentials = () => {
  const [login] = useLoginMutation({
    update: (cache, { data: { login } }) =>
      cache.writeQuery({
        query: CurrentUserQueryDocument,
        data: { currentUser: login.user },
      }),
  });
  return (
    <button onClick={() => login({ variables: user })}>
      Login as Maurice Moss
    </button>
  );
};
export default LoginWithCredentials;
