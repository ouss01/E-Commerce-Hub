import { useAuth } from '@/contexts/AuthContext';

// Helper to pass auth headers to generated hooks that require them
export function useAuthOptions() {
  const { token } = useAuth();
  
  return {
    request: {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : undefined
    }
  };
}

export function formatPrice(price: number) {
  return price.toFixed(2);
}
