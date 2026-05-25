import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Toaster } from 'sonner';

function AppContent() {
  const { settings } = useSettings();
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        richColors 
        position="top-right" 
        theme={settings.theme === 'system' ? 'system' : settings.theme} 
      />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}