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
			const mediaDevices = navigator.mediaDevices as MediaDevices & {
				__DEBUGGED?: boolean;
			};

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
							const audioObj: Record<string, unknown> = {
								...(constraints.audio as MediaTrackConstraints),
							};
							const hadSampleRate = Object.hasOwn(audioObj, "sampleRate");
							const hadChannelCount = Object.hasOwn(audioObj, "channelCount");

							delete audioObj.sampleRate;
							delete audioObj.channelCount;
							// Telephony processing can clamp SR to 16k; disable to favor device default SR
							if (audioObj.echoCancellation !== false)
								audioObj.echoCancellation = false;
							if (audioObj.noiseSuppression !== false)
								audioObj.noiseSuppression = false;
							if (audioObj.autoGainControl !== false)
								audioObj.autoGainControl = false;
							patched = {
								...constraints,
								audio: audioObj,
							};
							console.info("[AudioDebugShim] patched audio constraints", {
								strippedSampleRate: hadSampleRate,
								strippedChannelCount: hadChannelCount,
								patched,
							});
						}
						try {
							const stream = await originalGUM(patched);
							const audioTracks = stream.getAudioTracks();

							audioTracks.forEach((t, i) => {
								const s: MediaTrackSettings = (t.getSettings?.() ??
									{}) as MediaTrackSettings;

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
			type MutableWindow = Window & {
				AudioContext?: typeof AudioContext;
				webkitAudioContext?: typeof AudioContext;
			};
			const win = window as unknown as MutableWindow;
			const wrappedCtors = new WeakSet<object>();
			const OriginalAC = win.AudioContext as typeof AudioContext | undefined;
			const OriginalWkAC = win.webkitAudioContext as
				| typeof AudioContext
				| undefined;
			const wrapCtor = (AC: typeof AudioContext | undefined, label: string) => {
				if (!AC || wrappedCtors.has(AC as unknown as object)) return AC;
				const Wrapped = new Proxy(AC, {
					construct(target, args: unknown[]) {
						const Ctor = target as unknown as new (
							...a: unknown[]
						) => AudioContext;
						const ctx = new Ctor(...(args as unknown[]));

						try {
							console.info(`[AudioDebugShim] ${label} created`, {
								sampleRate: ctx.sampleRate,
								state: ctx.state,
							});
						} catch {}

						return ctx;
					},
				});

				wrappedCtors.add(AC as unknown as object);
				wrappedCtors.add(Wrapped as unknown as object);

				return Wrapped;
			};

			if (OriginalAC) win.AudioContext = wrapCtor(OriginalAC, "AudioContext");
			if (OriginalWkAC)
				win.webkitAudioContext = wrapCtor(OriginalWkAC, "webkitAudioContext");

			// Patch AudioContext.createMediaStreamSource to log sample rates at connection time
			const wrappedMethods = new WeakSet<object>();
			const OriginalCreate = win.AudioContext?.prototype
				?.createMediaStreamSource as
				| ((
						this: BaseAudioContext,
						stream: MediaStream,
				  ) => MediaStreamAudioSourceNode)
				| undefined;

			if (OriginalCreate && !wrappedMethods.has(OriginalCreate)) {
				const WrappedCreate = function (
					this: BaseAudioContext,
					stream: MediaStream,
				) {
					try {
						const sr = this.sampleRate;
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
				} as (
					this: BaseAudioContext,
					stream: MediaStream,
				) => MediaStreamAudioSourceNode;

				if (win.AudioContext) {
					const proto = win.AudioContext.prototype as AudioContext & {
						createMediaStreamSource: (
							this: BaseAudioContext,
							stream: MediaStream,
						) => MediaStreamAudioSourceNode;
					};
					proto.createMediaStreamSource = WrappedCreate;
				}
				wrappedMethods.add(OriginalCreate as unknown as object);
				wrappedMethods.add(WrappedCreate as unknown as object);
			}
		} catch (e) {
			console.warn("[AudioDebugShim] init failed", e);
		}
	}, []);

	return null;
}
