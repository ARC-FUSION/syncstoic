import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  };
}
