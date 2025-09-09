// Example: TypeScript client calling the local Pollinations TTS proxy route

async function speak(text: string, voice = "alloy") {
	const qs = new URLSearchParams({ prompt: text, voice });
	const res = await fetch(`/api/pollinations/text/tts?${qs.toString()}`);
	if (!res.ok) throw new Error(await res.text());
	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const audio = new Audio(url);
	audio.onended = () => URL.revokeObjectURL(url);
	await audio.play();
}

// Usage
void speak("Hello from Pollinations TTS", "nova");
