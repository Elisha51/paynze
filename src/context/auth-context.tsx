
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Staff, Role, OnboardingFormData } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { useRouter } from 'next/navigation';

type UserWithPermissions = Staff & { 
  permissions: Role['permissions'];
  plan: OnboardingFormData['plan'];
};

type AuthContextType = {
  user: UserWithPermissions | null;
  isLoading: boolean;
  login: (user: Staff) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserWithPermissions | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserPermissions = useCallback(async (staffMember: Staff) => {
    const roles = await getRoles();
    const userRole = roles.find(r => r.name === staffMember.role);
    
    const onboardingDataRaw = localStorage.getItem('onboardingData');
    const plan = onboardingDataRaw ? (JSON.parse(onboardingDataRaw) as OnboardingFormData).plan || 'Growth' : 'Growth';

    if (userRole) {
      setUser({ ...staffMember, permissions: userRole.permissions, plan });
    } else {
      const defaultRole = roles.find(r => r.name === 'Sales Agent');
      setUser({ ...staffMember, permissions: defaultRole!.permissions, plan });
    }
  }, []);

  useEffect(() => {
    const checkUserOnMount = async () => {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        const storedUserId = localStorage.getItem('loggedInUserId');
        if (storedUserId) {
          const allStaff = await getStaff();
          const loggedInUser = allStaff.find(s => s.id === storedUserId);
          if (loggedInUser) {
            await fetchUserPermissions(loggedInUser);
          } else {
            localStorage.removeItem('loggedInUserId');
          }
        }
      }
      setIsLoading(false);
    };
    checkUserOnMount();
  }, [fetchUserPermissions]);

  const login = useCallback(async (userToLogin: Staff) => {
    localStorage.setItem('loggedInUserId', userToLogin.id);
    await fetchUserPermissions(userToLogin);
    
    // Check if onboarding data exists. If not, user must complete onboarding.
    const onboardingData = localStorage.getItem('onboardingData');
    
    if (onboardingData) {
        router.push('/dashboard');
    } else {
        router.push('/get-started');
    }
  }, [fetchUserPermissions, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('loggedInUserId');
    // We intentionally don't clear onboardingData so the store can still function
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
