"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type AccountProfile = { id: string; name: string; email: string };
const SessionContext = createContext<{
  account: AccountProfile | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}>({ account: null, loading: true, error: "", reload: async () => {} });
export function AccountSession({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountProfile | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) throw Error();
      const data = await response.json();
      setAccount(data.account);
      setError("");
    } catch {
      setAccount(null);
      setError("Chưa thể kiểm tra tài khoản. Vui lòng tải lại trang.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/account", { cache: "no-store", signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setAccount(data.account);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Chưa thể kiểm tra tài khoản. Vui lòng tải lại trang.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);
  return (
    <SessionContext value={{ account, loading, error, reload }}>
      {children}
    </SessionContext>
  );
}
export const useAccount = () => useContext(SessionContext);
