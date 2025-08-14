export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await isAuthenticated();

  // if (!user) {
  //   return;
  // }
  return <main>{children}</main>;
}
