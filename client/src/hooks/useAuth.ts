import { useEffect, useState } from 'react';

interface User {
  userId: number;
  username?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authenticationLoading, setAuthenticationLoading] = useState(true);

  // Check for an existing session
  useEffect(() => {
    fetch('/api/users/me', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) =>
        setUser({
          userId: data.userId,
          username: data.username,
        })
      )
      .catch(() => setUser(null))
      .finally(() => setAuthenticationLoading(false));
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    setUser,
    authenticationLoading,
    handleLogout,
  };
}