import { useNavigate, useRouteError } from "react-router-dom";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "../UI/Button";

export default function ErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  const handleRestart = async () => {
    // await invoke('stop_log_monitor');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2 px-6 text-center">
      <img
        src={'/aimi/Shock.png'}
        className="w-40 aspect-square rounded-xl object-cover absolute top-48"
      />
      <p className="text-3xl font-bold text-error">Oops! We've crashed!</p>
      <p className="text-xs text-char-secondary whitespace-pre-wrap mb-4">{error?.message ?? String(error)}</p>
      <Button
        variant="danger"
        size="md"
        onClick={handleRestart}
        iconLeft={<ArrowCounterClockwiseIcon size={15} />}
      >
        Restart App
      </Button>
    </div>
  );
}