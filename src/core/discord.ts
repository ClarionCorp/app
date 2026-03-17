import { useEffect, useRef } from "react";
import { start, stop, setActivity, clearActivity } from "tauri-plugin-drpc";
import { Activity, Assets, Timestamps, Button } from "tauri-plugin-drpc/activity";

const APP_ID = "1483520798017982707";

export interface RpcActivityOptions {
  details?: string;
  state?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  buttons?: { label: string; url: string }[];
}

export const DEFAULT_ACTIVITY: RpcActivityOptions = {
  details: "Idling...",
  state: "Powered by Ai.Mi App",
  largeImage: "aimiapp_logo",
  buttons: [{ label: "Download Companion", url: "https://clarioncorp.net/download" }],
}

export function useDiscordRpc() {
  const started = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await start(APP_ID);
        started.current = true;
        if (mounted) await updateActivity(DEFAULT_ACTIVITY);
      } catch (err) {
        console.error("Discord RPC failed to start:", err);
      }
    }

    init();

    return () => {
      mounted = false;
      stop().catch(() => {});
    };
  }, []);

  async function updateActivity(options: RpcActivityOptions) {
    if (!started.current) return;

    const {
      details,
      state,
      largeImage = "aimiapp_logo",
      largeText = "Ai.Mi App",
      smallImage,
      smallText,
      startTimestamp,
      endTimestamp,
      buttons,
    } = options;

    let activity = new Activity();

    if (details) activity = activity.setDetails(details);
    if (state) activity = activity.setState(state);

    const assets = new Assets()
      .setLargeImage(largeImage)
      .setLargeText(largeText);
    if (smallImage) assets.setSmallImage(smallImage);
    if (smallText) assets.setSmallText(smallText);
    activity = activity.setAssets(assets);

    if (startTimestamp !== undefined || endTimestamp !== undefined) {
      activity = activity.setTimestamps(
        new Timestamps(startTimestamp ?? Date.now(), endTimestamp)
      );
    }

    if (buttons?.length) {
      activity = activity.setButton(
        buttons.map((b) => new Button(b.label, b.url))
      );
    }

    await setActivity(activity);
  }

  async function clear() {
    if (!started.current) return;
    await clearActivity();
  }

  return { updateActivity, clear };
}