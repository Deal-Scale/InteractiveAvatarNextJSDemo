"use client";

import { useEffect } from "react";

/**
 * AudioDebugShim
 * - Logs getUserMedia constraints and resulting track settings
 * - Logs AudioContext.createMediaStreamSource calls with context sampleRate
 * This is diagnostic-only; it does not alter audio graph behavior.
 */
export default function AudioDebugShim() {
  useEffect(() => {
    try {
      // Patch getUserMedia to log constraints and resulting tracks
      const mediaDevices = navigator.mediaDevices as any;
      if (mediaDevices && !mediaDevices.__DEBUGGED) {
        const originalGUM = mediaDevices.getUserMedia?.bind(mediaDevices);
        if (typeof originalGUM === "function") {
          mediaDevices.getUserMedia = async (
            constraints: MediaStreamConstraints,
          ) => {
            console.info(
              "[AudioDebugShim] getUserMedia called with:",
              constraints,
            );
            // If SDK forces sampleRate/channelCount, strip them so the browser picks hardware defaults
            let patched = constraints;
            if (constraints?.audio && typeof constraints.audio === "object") {
              const audioObj = {
                ...(constraints.audio as MediaTrackConstraints),
              } as Record<string, any>;
              const hadSampleRate = Object.prototype.hasOwnProperty.call(
                audioObj,
                "sampleRate",
              );
              const hadChannelCount = Object.prototype.hasOwnProperty.call(
                audioObj,
                "channelCount",
              );
              delete audioObj.sampleRate;
              delete audioObj.channelCount;
              // Telephony processing can clamp SR to 16k; disable to favor device default SR
              if (audioObj.echoCancellation !== false) audioObj.echoCancellation = false;
              if (audioObj.noiseSuppression !== false) audioObj.noiseSuppression = false;
              if (audioObj.autoGainControl !== false) audioObj.autoGainControl = false;
              patched = { ...constraints, audio: audioObj } as MediaStreamConstraints;
              console.info("[AudioDebugShim] patched audio constraints", {
                strippedSampleRate: hadSampleRate,
                strippedChannelCount: hadChannelCount,
                patched,
              });
            }
            try {
              const stream: MediaStream = await originalGUM(patched);
              const audioTracks = stream.getAudioTracks();
              audioTracks.forEach((t, i) => {
                const s: any = t.getSettings?.() ?? {};
                console.info(
                  `[AudioDebugShim] getUserMedia result track#${i} settings`,
                  {
                    deviceId: s.deviceId,
                    sampleRate: s.sampleRate,
                    channelCount: s.channelCount,
                    echoCancellation: s.echoCancellation,
                    noiseSuppression: s.noiseSuppression,
                    autoGainControl: s.autoGainControl,
                  },
                );
              });
              return stream;
            } catch (e) {
              console.error("[AudioDebugShim] getUserMedia error", e);
              throw e;
            }
          };
          mediaDevices.__DEBUGGED = true;
        }
      }

      // Log new AudioContext creation sample rates
      const OriginalAC: any = (window as any).AudioContext;
      const OriginalWkAC: any = (window as any).webkitAudioContext;
      const wrapCtor = (AC: any, label: string) => {
        if (!AC || AC.__WRAPPED) return AC;
        const Wrapped = new Proxy(AC, {
          construct(target, args: any[]) {
            const ctx = new (target as any)(...args);
            try {
              console.info(`[AudioDebugShim] ${label} created`, {
                sampleRate: (ctx as any).sampleRate,
                state: (ctx as any).state,
              });
            } catch {}
            return ctx;
          },
        });
        (Wrapped as any).__WRAPPED = true;
        return Wrapped;
      };
      if (OriginalAC) (window as any).AudioContext = wrapCtor(OriginalAC, "AudioContext");
      if (OriginalWkAC)
        (window as any).webkitAudioContext = wrapCtor(
          OriginalWkAC,
          "webkitAudioContext",
        );

      // Patch AudioContext.createMediaStreamSource to log sample rates at connection time
      const OriginalCreate: any = (window as any).AudioContext?.prototype
        ?.createMediaStreamSource;
      if (OriginalCreate && !OriginalCreate.__WRAPPED) {
        (window as any).AudioContext.prototype.createMediaStreamSource = function (
          this: BaseAudioContext,
          stream: MediaStream,
        ) {
          try {
            const sr = (this as any).sampleRate;
            const tracks = stream.getAudioTracks?.() ?? [];
            const settings = tracks[0]?.getSettings?.() ?? {};
            console.info(
              "[AudioDebugShim] createMediaStreamSource: context SR=",
              sr,
              "track settings=",
              settings,
            );
          } catch (e) {
            console.warn(
              "[AudioDebugShim] createMediaStreamSource logging failed",
              e,
            );
          }
          return OriginalCreate.call(this, stream);
        } as any;
        (window as any).AudioContext.prototype.createMediaStreamSource.__WRAPPED =
          true;
      }
    } catch (e) {
      console.warn("[AudioDebugShim] init failed", e);
    }
  }, []);

  return null;
}
