import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../App';
import { verifyClientFiles } from '../core/init';
import { checkUE4SS, installUE4SS } from '../core/utilities/ue4ss';
import { getAppSettings } from '../core/database/queries';

type Status = { message: string; error: boolean };

export default function InitPage() {
  const { navigate, setOdyAuth } = useOutletContext<AppContextType>();
  const [status, setStatus] = useState<Status>({ message: 'Starting up...', error: false });

  useEffect(() => {
    async function init() {
      try {
        // Check if first-time setup is done
        const settings = await getAppSettings();
        if (!settings?.finishedSetup) {
          navigate('/setup');
          return;
        }

        // Verify identity and set auth
        setStatus({ message: 'Verifying account...', error: false });
        const auth = await verifyClientFiles();
        setOdyAuth(auth);

        // Check and install UE4SS if missing
        if (!settings.ue4ss) {
          await installUE4SS((stage, percent, message) => {
            setStatus({ message, error: false });
          }, undefined);
        }

        navigate('/home');
      } catch (e) {
        setStatus({ message: String(e), error: true });
      }
    }

    init();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white gap-4">
      {!status.error && (
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
      <p className={`text-sm ${status.error ? 'text-red-400' : 'text-char-subtle'}`}>
        {status.message}
      </p>
      {status.error && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-primary underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
