import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import Button from './Button';

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [message, setMessage] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      setMessage('To install, open your browser menu and choose “Install app” or “Add to Home Screen”.');
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <div>
      <Button variant="outline" icon={Download} onClick={install}>Install app</Button>
      {message && <p role="status" className="mt-2 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}
