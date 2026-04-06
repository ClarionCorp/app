'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ShieldIcon,
  CheckCircleIcon,
  WarningIcon,
  ArrowCounterClockwiseIcon,
  DownloadSimpleIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import { Checkbox } from '../components/UI/Checkbox';
import { Button } from '../components/UI/Button';
import { TermsOfService } from '../core/objects/terms';
import { upsertSettings } from '../core/database/queries';
import { useOutletContext } from 'react-router-dom';
import { AppContextType } from '../App';
import { useToast } from '../components/UI/Toast';
import { TelemetryOption, telemetryOptions } from '../types/settings';
import { installUE4SS } from '../core/utilities/ue4ss';

type Step = 'welcome' | 'terms' | 'telemetry' | 'ue4ss';
const STEPS: Step[] = ['welcome', 'terms', 'telemetry', 'ue4ss'];

const EASE = [0.16, 1, 0.3, 1] as const;
const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: EASE },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -32 : 32,
    opacity: 0,
    transition: { duration: 0.2, ease: EASE },
  }),
};

function WelcomeStep() {
  return (
    <div className="flex flex-col gap-6 items-center justify-center flex-1 text-center">
      <div className="flex flex-col gap-2 items-center">
        <h1 className="text-2xl font-semibold text-char tracking-tight">Welcome to The Ai.Mi App!</h1>
        <p className="text-sm text-char-subtle leading-relaxed max-w-sm mx-auto">
          This is a companion app for Omega Strikers; this means it should be run alongside the game.<br /><br />
          Before we start, we'll need to ask you some questions.
        </p>
      </div>
    </div>
  );
}

function TermsStep({ accepted, onAccepted }: { accepted: boolean; onAccepted: (v: boolean) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-4 items-center">
        <div className="size-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <ShieldIcon size={22} weight="duotone" className="text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-char tracking-tight">Terms of Service</h2>
          <p className="text-sm text-char-subtle">Please read and accept our terms to continue.</p>
        </div>
      </div>

      <div className="rounded-xl border border-background-border bg-surface-raised overflow-hidden">
        <div className="h-44 overflow-y-auto p-4 text-xs text-char-subtle leading-relaxed space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-background-border">
          {TermsOfService.sections.map((section) => (
            <div key={section.id} className="space-y-1.5">
              <p className="font-medium text-char">{section.title}</p>
              {section.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Checkbox
        checked={accepted}
        onChange={onAccepted}
        label="I agree to the Terms of Service"
        description="You must accept to continue using this app."
        icon={accepted ? <ShieldCheckIcon size={18} weight="duotone" /> : <ShieldIcon size={18} weight="duotone" />}
      />
    </div>
  );
}

function TelemetryStep({
  selected,
  onSelected,
}: {
  selected: Record<TelemetryOption, boolean>;
  onSelected: (key: TelemetryOption, val: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-4 items-center">
        <div className="size-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <ChartBarIcon size={22} weight="duotone" className="text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-char tracking-tight">Data Handling</h2>
          <p className="text-sm text-char-subtle">We would humbly request to use some data to make the experience better for everyone.</p>
        </div>
      </div>

      {telemetryOptions.map(opt => (
        <Checkbox
          key={opt.value}
          checked={selected[opt.value]}
          onChange={(val) => onSelected(opt.value, val)}
          label={opt.label}
          description={opt.description}
          icon={opt.icon}
        />
      ))}
    </div>
  );
}

function UE4SSStep({
  status,
  percent,
  message,
  onInstall,
}: {
  status: 'idle' | 'installing' | 'done' | 'error';
  percent: number | null;
  message: string;
  onInstall: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-4 items-center">
        <div className="size-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <WrenchIcon size={22} weight="duotone" className="text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-char tracking-tight">Install UE4SS?</h2>
          <p className="text-sm text-char-subtle">
            UE4SS is a mod loader that lets us dig deeper into your game stats. You can skip this and install it later.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-background-border bg-surface-raised p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-char">RE-UE4SS v3.0.1</p>
          <p className="text-xs text-char-subtle">
            Open-source scripting system, live viewer, and blueprint mod loader for UE4+ games.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="install-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button variant="primary" size="md" onClick={onInstall} iconLeft={<DownloadSimpleIcon size={14} weight="bold" />}>
                Install UE4SS & CC Mods
              </Button>
            </motion.div>
          )}

          {(status === 'installing') && (
            <motion.div
              key="progress"
              className="flex flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-char-subtle">{message}</p>
                {percent !== null && (
                  <p className="text-xs text-char-subtle tabular-nums">{percent}%</p>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-background-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: percent !== null ? `${percent}%` : '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              {percent === null && (
                <p className="text-xs text-char-subtle/60 italic">This may take a moment...</p>
              )}
            </motion.div>
          )}

          {status === 'done' && (
            <motion.div
              key="done"
              className="flex items-center gap-2 text-sm text-green-400"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircleIcon size={16} weight="duotone" />
              UE4SS installed successfully!
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm text-red-400 flex items-center gap-2">
                <WarningIcon size={16} weight="duotone" />
                Installation failed. You can try again later from Settings.
              </p>
              <Button variant="ghost" size="md" onClick={onInstall} iconLeft={<ArrowCounterClockwiseIcon size={14} weight="bold" />}>
                Retry
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SetupPage() {
  const { navigate } = useOutletContext<AppContextType>();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [direction, setDirection] = useState(1);
  const [ue4ssStatus, setUe4ssStatus] = useState<'idle' | 'installing' | 'done' | 'error'>('idle');
  const [ue4ssPercent, setUe4ssPercent] = useState<number | null>(null);
  const [ue4ssMessage, setUe4ssMessage] = useState('');
  const { toast } = useToast();

  // Step default state
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [telemetry, setTelemetry] = useState<Record<TelemetryOption, boolean>>({
    game_stats: true,
    play_state: true,
    play_count: true,
  });

  const currentIdx = STEPS.indexOf(currentStep);
  const isLast = currentIdx === STEPS.length - 1;
  const isFirst = currentIdx === 0;

  function canAdvance() {
    if (currentStep === 'terms') return termsAccepted;
    if (currentStep === 'ue4ss') return ue4ssStatus !== 'installing';
    return true;
  }

  async function advance() {
    if (currentStep == 'welcome') {
      await handleGameDir()
    }

    if (!canAdvance()) return;
    setDirection(1);
    if (!isLast) {
      setCurrentStep(STEPS[currentIdx + 1]);
    } else {
      await upsertSettings({
        sendStats: telemetry.game_stats,
        sendPlayState: telemetry.play_state,
        sendPlayCount: telemetry.play_count,
        appTerms: termsAccepted,
        finishedSetup: true
        // gbTerms
      })
      console.debug('Setup complete', { termsAccepted, telemetry });
      navigate('/home'); // go back home now :)
      toast('App setup completed, welcome~!', 'success');
    }
  }

  function back() {
    if (isFirst) return;
    setDirection(-1);
    setCurrentStep(STEPS[currentIdx - 1]);
  }

  async function handleInstallUE4SS() {
    setUe4ssStatus('installing');
    try {
      await installUE4SS((stage, percent, message) => {
        setUe4ssPercent(percent);
        setUe4ssMessage(message);
        if (stage === 'done') setUe4ssStatus('done');
      });
    } catch {
      setUe4ssStatus('error');
    }
  }

  async function handleGameDir() {
    await upsertSettings({ gameDir: `C:/Program Files (x86)/Steam/steamapps/common/OmegaStrikers` }); // we don't support different dirs yet (thanks tauri permissions)
  }

  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <img
            src={'/aimi/NOM.png'}
            className="w-40 aspect-square rounded-xl object-cover mt-4 mb-8"
          />
          <div className="relative w-full bg-surface border border-background-border rounded-2xl overflow-hidden shadow-lg">

            {/* Subtle top accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

            <div className="p-6 flex flex-col justify-between gap-6">
              {/* Step Content */}
              <div className="flex flex-col flex-1">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    className="flex flex-col flex-1"
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {currentStep === 'welcome' && <WelcomeStep />}
                    {currentStep === 'terms' && (
                      <TermsStep accepted={termsAccepted} onAccepted={setTermsAccepted} />
                    )}
                    {currentStep === 'telemetry' && (
                      <TelemetryStep selected={telemetry} onSelected={(key, val) => setTelemetry(prev => ({ ...prev, [key]: val }))} />
                    )}
                    {currentStep === 'ue4ss' && (
                      <UE4SSStep
                        status={ue4ssStatus}
                        percent={ue4ssPercent}
                        message={ue4ssMessage}
                        onInstall={handleInstallUE4SS}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-background-border">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={back}
                  disabled={isFirst}
                  iconLeft={<ArrowLeftIcon size={14} weight="bold" />}
                >
                  Back
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={advance}
                  disabled={!canAdvance()}
                  iconRight={
                    isLast ? (
                      <CheckIcon size={14} weight="bold" />
                    ) : (
                      <ArrowRightIcon size={14} weight="bold" />
                    )
                  }
                >
                  {isLast ? 'Finish Setup' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtext */}
        <p className="text-center text-xs text-char-subtle/40">
          {currentStep === 'telemetry'
            ? 'You can update telemetry preferences at any time in Settings.'
            : 'Your preferences are saved locally and never shared.'}
        </p>
      </div>
    </div>
  );
}