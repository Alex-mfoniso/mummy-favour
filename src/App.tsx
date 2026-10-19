import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessSettingsProvider } from '@/context/BusinessSettingsContext';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BusinessSettingsProvider>
        <RouterProvider router={router} />
      </BusinessSettingsProvider>
    </AuthProvider>
  );
};

export default App;
