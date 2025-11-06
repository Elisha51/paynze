
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
    
    const isDevMode = process.env.NODE_ENV === 'development';
    const onboardingDataRaw = localStorage.getItem('onboardingData');
    const basePlan = onboardingDataRaw ? (JSON.parse(onboardingDataRaw) as OnboardingFormData).plan || 'Growth' : 'Growth';
    const plan = isDevMode ? 'Enterprise' : basePlan;

    if (userRole) {
      setUser({ ...staffMember, permissions: userRole.permissions, plan });
    } else {
      // Fallback for roles not explicitly defined (e.g., dynamic roles)
      // This is a sensible default for a production environment.
      const defaultRole = roles.find(r => r.name === 'Sales Agent');
      setUser({ ...staffMember, permissions: defaultRole!.permissions, plan });
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
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
      setIsLoading(false);
    };
    checkUser();
  }, [fetchUserPermissions]);

  const login = useCallback(async (userToLogin: Staff) => {
    localStorage.setItem('loggedInUserId', userToLogin.id);
    await fetchUserPermissions(userToLogin);
    router.push('/dashboard');
  }, [fetchUserPermissions, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('loggedInUserId');
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
