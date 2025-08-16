import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SessionConfigHeader() {
  return (
    <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
      <DialogHeader>
        <DialogTitle className="text-lg md:text-xl font-semibold">
          Session Configuration
        </DialogTitle>
        <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400">
          Adjust your avatar and voice settings before starting the session.
        </DialogDescription>
      </DialogHeader>
    </div>
  );
}
