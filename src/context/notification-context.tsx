
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { Notification } from '@/lib/types';
import { getNotifications as fetchNotifications } from '@/services/notifications';

type NotificationFilter = 'all' | 'unread';

type NotificationContextType = {
  notifications: Notification[];
  filteredNotifications: Notification[];
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  archiveAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');

  useEffect(() => {
    async function loadNotifications() {
      const fetchedNotifications = await fetchNotifications();
      setNotifications(fetchedNotifications);
    }
    loadNotifications();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, archived: true } : n))
    );
  }, []);
  
  const archiveAllRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => n.read ? { ...n, archived: true } : n)
    );
  }, []);
  
  const activeNotifications = useMemo(() => {
      return notifications.filter(n => !n.archived);
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return activeNotifications.filter(n => !n.read);
    }
    return activeNotifications;
  }, [activeNotifications, filter]);

  const unreadCount = useMemo(() => {
    return activeNotifications.filter(n => !n.read).length;
  }, [activeNotifications]);

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications: activeNotifications, 
        filteredNotifications,
        filter,
        setFilter,
        unreadCount,
        markAsRead, 
        markAllAsRead, 
        archiveNotification,
        archiveAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
