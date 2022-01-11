import { useLogoutMutation, CurrentUserDocument } from "./generated/graphql";
const LogoutButton = () => {
  const [logout] = useLogoutMutation({
    update: (cache) =>
      cache.writeQuery({
        query: CurrentUserDocument,
        data: { currentUser: null },
      }),
  });
  return (
    <button
      onClick={() => {
        logout();
      }}
    >
      Logout
    </button>
  );
};
export default LogoutButton;
