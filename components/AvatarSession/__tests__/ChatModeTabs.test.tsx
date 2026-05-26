import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatModeTabs } from "../ChatTabs";

describe("ChatModeTabs", () => {
	it("marks text mode as selected and surfaces HeyGen provider copy", () => {
		render(
			<ChatModeTabs
				value="text"
				onValueChange={() => {}}
				isVoiceActive={false}
				isVoiceLoading={false}
			/>,
		);

		const textTab = screen.getByRole("tab", { name: /text/i });
		expect(textTab).toHaveAttribute("aria-selected", "true");
		expect(
			within(textTab).getByText(/HeyGen Streaming Avatar/i),
		).toBeInTheDocument();
	});

	it("invokes onValueChange when switching to voice", () => {
		const handleChange = vi.fn();
		render(
			<ChatModeTabs
				value="text"
				onValueChange={handleChange}
				isVoiceActive={false}
				isVoiceLoading={false}
			/>,
		);

		fireEvent.click(screen.getByRole("tab", { name: /voice/i }));
		expect(handleChange).toHaveBeenCalledWith("voice");
	});

	it("shows an active status message when voice chat is live", () => {
		render(
			<ChatModeTabs
				value="voice"
				onValueChange={() => {}}
				isVoiceActive
				isVoiceLoading={false}
			/>,
		);

		expect(
			screen.getByText(/ElevenLabs voice chat is live/i),
		).toBeInTheDocument();
	});
});
