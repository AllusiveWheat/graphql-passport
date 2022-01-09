import {
  useLogoutMutation,
  CurrentUserQueryDocument,
} from "./generated/graphql";
const LogoutButton = () => {
  const [logout] = useLogoutMutation({
    update: (cache) =>
      cache.writeQuery({
        query: CurrentUserQueryDocument,
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
