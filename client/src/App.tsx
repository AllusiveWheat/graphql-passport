import SpotifyLogin from "./SpotifyLogin";
import PasswordSignUp from "./PasswordSignUp";
import LoginWithCredentials from "./LoginWithCredentials";
import LogoutButton from "./LogoutButton";
import { useCurrentUserQueryQuery } from "./generated/graphql";
import GoogleAuth from "./GoogleAuth";
const App = () => {
  const { loading, error, data } = useCurrentUserQueryQuery();
  if (loading) return <div>Loading</div>;
  if (error) return <div>Error: {JSON.stringify(error)}</div>;
  const isLoggedIn = !!data.currentUser;

  if (isLoggedIn) {
    const { id, firstName, lastName, email } = data.currentUser;
    return (
      <>
        {id}
        <br />
        {firstName} {lastName}
        <br />
        {email}
        <br />
        <LogoutButton />
      </>
    );
  }

  // SIGNUP AND LOGIN GO HERE
  return (
    <div>
      <SpotifyLogin />
      <GoogleAuth />
      <PasswordSignUp />
      <LoginWithCredentials />
    </div>
  );
};

export default App;
