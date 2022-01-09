import React from "react";
import {
  useRegisterMutation,
  CurrentUserQueryDocument,
} from "./generated/graphql";

const PasswordSignUp = () => {
  const [signUp] = useRegisterMutation({
    update: (cache, { data }) => {
      cache.writeQuery({
        query: CurrentUserQueryDocument,
        data: {
          currentUser: data.register.user,
        },
      });
    },
  });

  const user = {
    firstName: "G",
    lastName: "G",
    email: "jGen@barber.com",
    password: "qwerty",
  };
  return (
    <button onClick={() => signUp({ variables: user })}>
      Signup as Jen Barber
    </button>
  );
};

export default PasswordSignUp;
