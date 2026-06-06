import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// biome-ignore lint/style/useImportType: Vitest's JSX transform for this app requires React at runtime.
import React from "react";
import { beforeAll, describe, expect, it } from "vitest";

import BookmarkModal from "../../Sidebar/BookmarkModal";
import { Dialog, DialogContent, DialogTitle } from "../dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../select";

beforeAll(() => {
	Element.prototype.scrollIntoView =
		Element.prototype.scrollIntoView ?? (() => {});
	HTMLElement.prototype.hasPointerCapture =
		HTMLElement.prototype.hasPointerCapture ?? (() => false);
	HTMLElement.prototype.setPointerCapture =
		HTMLElement.prototype.setPointerCapture ?? (() => {});
	HTMLElement.prototype.releasePointerCapture =
		HTMLElement.prototype.releasePointerCapture ?? (() => {});
});

function NonDismissableDialog({ children }: { children: React.ReactNode }) {
	return (
		<Dialog modal={false} open>
			<DialogContent
				onInteractOutside={(event) => event.preventDefault()}
				aria-describedby={undefined}
			>
				<DialogTitle>Overlay dismiss test</DialogTitle>
				{children}
			</DialogContent>
		</Dialog>
	);
}

describe("shared overlay dismissal", () => {
	it("closes dropdown menus on outside pointer events inside non-dismissable dialogs", async () => {
		render(
			<NonDismissableDialog>
				<DropdownMenu>
					<DropdownMenuTrigger>Actions</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem>Move to folder</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</NonDismissableDialog>,
		);

		const trigger = screen.getByRole("button", { name: "Actions" });
		trigger.focus();
		fireEvent.keyDown(trigger, { key: "ArrowDown" });
		expect(await screen.findByRole("menu")).toBeInTheDocument();
		await new Promise((resolve) => window.setTimeout(resolve, 0));
		expect(screen.getByRole("menu")).toBeInTheDocument();
		fireEvent.pointerDown(document.body);

		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("closes selects on outside pointer events inside non-dismissable dialogs", async () => {
		render(
			<NonDismissableDialog>
				<Select defaultOpen defaultValue="general">
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="general">General</SelectItem>
						<SelectItem value="sales">Sales</SelectItem>
					</SelectContent>
				</Select>
			</NonDismissableDialog>,
		);

		expect(screen.getByRole("listbox")).toBeInTheDocument();
		await new Promise((resolve) => window.setTimeout(resolve, 0));
		fireEvent.pointerDown(document.body);

		await waitFor(() => {
			expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		});
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("closes the bookmark folder select when clicking another field in the same modal", async () => {
		render(
			<BookmarkModal
				open
				onClose={() => {}}
				bookmarkedIds={new Set()}
				bookmarkTargetId="conversation-1"
				bookmarkFolders={[
					{ id: "sales", name: "Sales" },
					{ id: "pipeline", name: "Pipeline", parentId: "sales" },
				]}
				draftTitle="Current chat"
				setDraftTitle={() => {}}
				draftFolderId=""
				setDraftFolderId={() => {}}
				draftNewFolder=""
				setDraftNewFolder={() => {}}
				draftTags=""
				setDraftTags={() => {}}
				onSave={() => {}}
			/>,
		);

		const folderSelect = screen.getByRole("combobox");
		fireEvent.pointerDown(folderSelect, {
			button: 0,
			ctrlKey: false,
			pointerId: 1,
			pointerType: "mouse",
		});
		fireEvent.pointerUp(folderSelect, {
			button: 0,
			pointerId: 1,
			pointerType: "mouse",
		});
		fireEvent.click(folderSelect);
		expect(await screen.findByRole("listbox")).toBeInTheDocument();
		await new Promise((resolve) => window.setTimeout(resolve, 150));
		expect(screen.getByRole("listbox")).toBeInTheDocument();
		await waitFor(() => {
			expect(document.body.style.pointerEvents).not.toBe("none");
		});

		fireEvent.pointerDown(screen.getByPlaceholderText("New folder name"));

		await waitFor(() => {
			expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		});
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});
});
