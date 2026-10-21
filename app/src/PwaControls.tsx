import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PwaControls({ onActualizacion }: { onActualizacion?: (disponible: boolean) => void }) {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installError, setInstallError] = useState('');
  const [swError, setSwError] = useState('');
  const [prepared, setPrepared] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      setPrepared(Boolean(registration?.active));
    },
    onRegisterError() {
      setSwError('No se pudo preparar el acceso offline. Podés seguir usando la página con conexión.');
    },
  });

  useEffect(() => {
    onActualizacion?.(needRefresh);
  }, [needRefresh, onActualizacion]);

  useEffect(() => {
    // Una recarga offline ya puede estar controlada aunque el callback de
    // registro aún espere la comprobación de actualización con la red.
    let vigente = true;
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then(registration => {
        if (vigente && registration?.active) setPrepared(true);
      }).catch(() => { /* El callback de registro informa los errores reales. */ });
    }
    const offerInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    const installed = () => setInstallEvent(null);
    const changeConnection = () => setOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt', offerInstall);
    window.addEventListener('appinstalled', installed);
    window.addEventListener('online', changeConnection);
    window.addEventListener('offline', changeConnection);
    return () => {
      vigente = false;
      window.removeEventListener('beforeinstallprompt', offerInstall);
      window.removeEventListener('appinstalled', installed);
      window.removeEventListener('online', changeConnection);
      window.removeEventListener('offline', changeConnection);
    };
  }, []);

  async function instalar() {
    if (!installEvent) return;
    setInstallError('');
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } catch {
      setInstallError('No se pudo abrir la instalación. Revisá el menú del navegador.');
    } finally {
      setInstallEvent(null);
    }
  }

  return (
    <aside className="pwa-panel" aria-label="Instalación y conexión">
      <div className="pwa-top">
        <span className={`connection ${online ? '' : 'is-offline'}`}>
          <span className="connection-dot" aria-hidden="true" /> {online ? 'Red disponible' : 'Sin conexión'}
        </span>
        {installEvent && <button className="button small secondary" onClick={instalar}>Instalar app</button>}
      </div>
      <p>{offlineReady || prepared ? 'Interfaz preparada para abrir sin conexión en este navegador.' : 'La preparación offline se completa al cargar la versión de producción con conexión.'}</p>
      <p className="muted">La instalación depende del navegador. Si está disponible, también podés usar su menú para instalar o agregar al inicio.</p>
      {needRefresh && (
        <div className="update-notice">
          <p>Hay una versión nueva. Aplicarla recarga la pantalla; terminá de registrar la serie antes.</p>
          <button className="button small" onClick={() => { void updateServiceWorker(true).catch(() => setSwError('No se pudo aplicar la actualización. Intentá de nuevo con conexión.')); }}>Aplicar actualización</button>
        </div>
      )}
      {(installError || swError) && <p role="alert">{installError || swError}</p>}
    </aside>
  );
}
