import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ActivationModal } from './Auth/ActivationModal';
import { ActivationStatus } from './Auth/ActivationStatus';

interface ProtectedAppProps {
  children: React.ReactNode;
}

export const ProtectedApp: React.FC<ProtectedAppProps> = ({ children }) => {
  const { isActivated, isExpired } = useAuth();

  // Show activation modal if not activated or expired
  if (!isActivated || isExpired()) {
    return <ActivationModal />;
  }

  // Show main app with activation status
  return (
    <>
      <ActivationStatus />
      {children}
    </>
  );
};
