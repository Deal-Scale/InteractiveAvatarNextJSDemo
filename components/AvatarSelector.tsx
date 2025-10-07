import React, { useState } from "react";
import { Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAgentStore } from "@/lib/stores/agent";
import { useSessionStore } from "@/lib/stores/session";
import { AVATARS } from "@/app/lib/constants";
import { AvatarQuality } from "@heygen/streaming-avatar";

interface AvatarSelectorProps {
	className?: string;
	onStartSession?: () => void;
}

export function AvatarSelector({
	className,
	onStartSession,
}: AvatarSelectorProps) {
	const { currentAgent, updateAgent } = useAgentStore();
	const { openConfigModal } = useSessionStore();
	const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
		currentAgent?.avatarId || AVATARS[0].avatar_id,
	);

	const handleAvatarSelect = (avatarId: string) => {
		setSelectedAvatarId(avatarId);
		// Update agent store with selected avatar
		updateAgent({ avatarId });
	};

	const handleStartSession = () => {
		// Update agent with selected avatar if not already set
		if (currentAgent?.avatarId !== selectedAvatarId) {
			updateAgent({ avatarId: selectedAvatarId });
		}

		// Call external start session handler or open config modal
		if (onStartSession) {
			onStartSession();
		} else {
			// Fallback to opening config modal with session tab
			openConfigModal("session");
		}
	};

	const handleOpenSettings = () => {
		openConfigModal("agent");
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Choose Your Avatar</h3>
				<Button
					variant="outline"
					size="sm"
					onClick={handleOpenSettings}
					className="gap-2"
				>
					<Settings className="h-4 w-4" />
					Settings
				</Button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
				{AVATARS.map((avatar) => (
					<Card
						key={avatar.avatar_id}
						className={`cursor-pointer transition-all hover:shadow-md ${
							selectedAvatarId === avatar.avatar_id
								? "ring-2 ring-primary bg-primary/5"
								: "hover:bg-muted/50"
						}`}
						onClick={() => handleAvatarSelect(avatar.avatar_id)}
					>
						<CardContent className="p-3 text-center space-y-2">
							{/* Avatar placeholder - in a real implementation, this would show actual avatar thumbnails */}
							<div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
								{avatar.name.charAt(0)}
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium leading-tight">
									{avatar.name}
								</p>
								{selectedAvatarId === avatar.avatar_id && (
									<Badge variant="secondary" className="text-xs">
										Selected
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="flex justify-center pt-4">
				<Button onClick={handleStartSession} className="gap-2 px-8" size="lg">
					<Play className="h-5 w-5" />
					Start Avatar Session
				</Button>
			</div>

			{currentAgent?.name && (
				<div className="text-center text-sm text-muted-foreground">
					Current agent:{" "}
					<span className="font-medium">{currentAgent.name}</span>
				</div>
			)}
		</div>
	);
}
