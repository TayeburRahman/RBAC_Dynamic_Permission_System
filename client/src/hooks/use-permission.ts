import { useAuthContext } from "@/providers/auth-provider";

export function usePermission(permission: string) {
  const auth = useAuthContext();
  return auth.hasPermission(permission);
}
