import { Button } from "../components/UI/Button";
import { useOutletContext } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { AppContextType } from "../App";

export default function ComingSoonPage() {
  const { navigate } = useOutletContext<AppContextType>();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-2 px-6 text-center">
      <img
        src={'/aimi/Sweat.gif'}
        className="w-40 aspect-square rounded-xl object-cover absolute top-48"
      />
      <p className="text-3xl font-bold text-primary">Coming Soon!</p>
      <p className="text-xs text-char-secondary whitespace-pre-wrap mb-4">This page is still under construction! Sorry!</p>
      <Button
        variant="primary"
        size="md"
        onClick={() => navigate('/home')}
        iconLeft={<ArrowLeftIcon size={15} />}
      >
        Return Home
      </Button>
    </div>
  );
}