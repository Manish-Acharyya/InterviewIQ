import { createContext, useContext, useEffect, useState } from "react";
import { getcurrentUser, logoutUser } from "../services/authservice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

  //check authentication when app starts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getcurrentUser();
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }finally{
        setLoading(false)
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout API error:", error.message);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
