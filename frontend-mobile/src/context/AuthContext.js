import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_TOKEN = "token";
const STORAGE_USER = "user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER]);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await AsyncStorage.multiGet([
          STORAGE_TOKEN,
          STORAGE_USER,
        ]);
        const storedToken = t[1];
        const storedUser = u[1];
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    if (newUser?.role !== "user") {
      throw new Error(
        "Aplikasi mobile hanya bisa diakses akun user. Silakan login lewat website untuk role admin/super admin.",
      );
    }
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.multiSet([
      [STORAGE_TOKEN, newToken],
      [STORAGE_USER, JSON.stringify(newUser)],
    ]);
    return newUser;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post("/auth/register", payload);
    const { token: newToken, user: newUser } = res.data.data;
    if (newUser?.role !== "user") {
      throw new Error("Registrasi mobile hanya untuk role user.");
    }
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.multiSet([
      [STORAGE_TOKEN, newToken],
      [STORAGE_USER, JSON.stringify(newUser)],
    ]);
    return newUser;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login,
      register,
      logout,
    }),
    [user, token, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
