import type { Option } from "@/data/options";

import { useEffect, useState } from "react";

import {
	loadAvatarOptions,
	loadKnowledgeBaseOptions,
	loadMcpServerOptions,
	loadVoiceOptions,
} from "@/data/options";

export function useDynamicOptions() {
	const [avatarOptions, setAvatarOptions] = useState<Option[]>([]);
	const [voiceOptions, setVoiceOptions] = useState<Option[]>([]);
	const [mcpServerOptions, setMcpServerOptions] = useState<Option[]>([]);
	const [knowledgeBaseOptions, setKnowledgeBaseOptions] = useState<Option[]>(
		[],
	);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const [avatars, voices, mcp, kbs] = await Promise.all([
					loadAvatarOptions(),
					loadVoiceOptions(),
					loadMcpServerOptions(),
					loadKnowledgeBaseOptions(),
				]);

				if (!mounted) return;
				setAvatarOptions(avatars);
				setVoiceOptions(voices);
				setMcpServerOptions(mcp);
				setKnowledgeBaseOptions(kbs);
			} catch {
				// best-effort; keep empty on failure
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	return {
		avatarOptions,
		voiceOptions,
		mcpServerOptions,
		knowledgeBaseOptions,
	};
}
