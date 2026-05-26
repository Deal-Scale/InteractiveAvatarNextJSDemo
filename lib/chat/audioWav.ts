// * Client-side audio-to-WAV reassembly utilities
// * Reconstructs base64 inlineData chunks into a valid WAV Buffer (browser: Uint8Array)

export interface WavConversionOptions {
	numChannels: number;
	sampleRate: number;
	bitsPerSample: number;
}

export function parseMimeType(mimeType: string): WavConversionOptions {
	const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
	const [, format] = fileType.split("/");

	const options: Partial<WavConversionOptions> = {
		numChannels: 1,
		bitsPerSample: 16,
	};

	if (format?.startsWith("L")) {
		const bits = parseInt(format.slice(1), 10);
		if (!Number.isNaN(bits)) {
			options.bitsPerSample = bits;
		}
	}

	for (const param of params) {
		const [key, value] = param.split("=").map((s) => s.trim());
		if (key === "rate") {
			options.sampleRate = parseInt(value, 10);
		}
	}

	// ! Default if unspecified by server
	if (!options.sampleRate) options.sampleRate = 16000;

	return options as WavConversionOptions;
}

export function createWavHeader(
	dataLength: number,
	options: WavConversionOptions,
): Uint8Array {
	const { numChannels, sampleRate, bitsPerSample } = options;
	const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
	const blockAlign = (numChannels * bitsPerSample) / 8;
	const buffer = new ArrayBuffer(44);
	const view = new DataView(buffer);
	const u8 = new Uint8Array(buffer);

	// "RIFF"
	u8.set([82, 73, 70, 70], 0);
	view.setUint32(4, 36 + dataLength, true);
	// "WAVE"
	u8.set([87, 65, 86, 69], 8);
	// "fmt "
	u8.set([102, 109, 116, 32], 12);
	view.setUint32(16, 16, true); // PCM
	view.setUint16(20, 1, true); // AudioFormat PCM
	view.setUint16(22, numChannels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, byteRate, true);
	view.setUint16(32, blockAlign, true);
	view.setUint16(34, bitsPerSample, true);
	// "data"
	u8.set([100, 97, 116, 97], 36);
	view.setUint32(40, dataLength, true);

	return u8;
}

export function concatBase64ChunksToWav(
	chunks: string[],
	mimeType: string,
): Uint8Array {
	const options = parseMimeType(mimeType);
	const audioBytes = chunks.map((c) =>
		Uint8Array.from(atob(c), (ch) => ch.charCodeAt(0)),
	);
	const totalLen = audioBytes.reduce((sum, a) => sum + a.length, 0);
	const header = createWavHeader(totalLen, options);
	const result = new Uint8Array(header.length + totalLen);
	result.set(header, 0);
	let offset = header.length;
	for (const arr of audioBytes) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
}
