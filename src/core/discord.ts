import { useRef } from "react";
import { start, setActivity, clearActivity, stop } from "tauri-plugin-drpc";
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
  details: "Idling on Main Menu",
  state: "Powered by Ai.Mi App",
  largeImage: "aimiapp_logo",
  buttons: [{ label: "Download Companion App", url: "https://clarioncorp.net/app" }],
}

export function useDiscordRpc() {
  const started = useRef(false);

  async function startRpc() {
    try {
      console.log(`Starting new Discord RPC...`);
      await start(APP_ID);
      started.current = true;
    } catch (err) {
      console.error("Discord RPC failed to start:", err);
      throw err;
    }
  }

  async function stopRpc() {
    try {
      console.log(`Stopping current Discord RPC...`);
      await stop();
      started.current = false;
    } catch (err) {
      console.error("Discord RPC failed to stop:", err);
      throw err;
    }
  }

  async function updateActivity(options: RpcActivityOptions) {
    if (!started.current) { console.warn(`[DRPC] Current state is not set yet! Ignoring Command...`); return; };
    console.info(`Received request to change rich presence...`);
    console.debug(`DRPC Options: ${JSON.stringify(options, null, 1)}`);

    try {
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

      if (startTimestamp !== undefined) {
        activity = activity.setTimestamps(
          new Timestamps(startTimestamp ?? Date.now(), endTimestamp)
        );
      }

      if (buttons?.length) {
        activity = activity.setButton(
          buttons.map((b) => new Button(b.label, b.url))
        );
      }

      console.debug(activity);
      await setActivity(activity);
    } catch (e) {
      console.error(`[DRPC] Failed to update activity!`, e);
    }
  }

  async function clear() {
    if (!started.current) return;
    await clearActivity();
  }

  return { updateActivity, clear, startRpc, stopRpc };
}