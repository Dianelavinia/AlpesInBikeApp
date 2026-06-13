import { Redirect } from "expo-router";

export default function Index() {
  // TODO: vérifier session Supabase et router vers auth ou tabs
  // const session = useSession();
  // if (!session) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href="/(auth)/welcome" />;
}
