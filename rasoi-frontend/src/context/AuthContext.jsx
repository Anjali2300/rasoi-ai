import { createContext, useContext, useState } from "react";
import { login as loginRequest, signup as signupRequest } from "../api.js";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("rasoiUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  async function signup(userData) {
    const data = await signupRequest(userData);

    localStorage.setItem("rasoiToken", data.token);
    localStorage.setItem("rasoiUser", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  }

  async function login(userData) {
    const data = await loginRequest(userData);

    localStorage.setItem("rasoiToken", data.token);
    localStorage.setItem("rasoiUser", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  }

  function logout() {
    localStorage.removeItem("rasoiToken");
    localStorage.removeItem("rasoiUser");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}