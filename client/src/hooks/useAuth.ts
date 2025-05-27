import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    setToken(storedToken);
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If server auth fails but we have local data, use it
        if (localUser) {
          return localUser;
        }
        throw new Error('Unauthorized');
      }
      
      return response.json();
    }
  });

  // Use server user if available, otherwise fall back to local user
  const currentUser = user || localUser;

  return {
    user: currentUser,
    isLoading: !token ? false : isLoading,
    isAuthenticated: !!currentUser,
  };
}
