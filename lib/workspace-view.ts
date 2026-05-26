import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";

export type WorkspaceViewTab = "video" | "brain" | "data" | "actions";

export const COMPACT_BOTTOM_CHAT_HEIGHT_FRAC = 0.18;

export function switchWorkspaceView(tab: WorkspaceViewTab) {
	const placement = usePlacementStore.getState();
	const session = useSessionStore.getState();

	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(COMPACT_BOTTOM_CHAT_HEIGHT_FRAC);
	placement.setSidebarCollapsed(true);
	session.setControlsMinimized(true);
	if (tab === "video") {
		session.setChatExperience("avatar");
	}
	session.setViewTab(tab);
}
