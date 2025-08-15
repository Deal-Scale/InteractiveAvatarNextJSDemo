"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
import Sidebar from '@/components/Sidebar';
import { ApiServiceProvider } from "@/components/logic/ApiServiceContext";
import { HeyGenService } from "@/lib/services/heygen";

const heygenService = new HeyGenService();

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-row">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
          <ApiServiceProvider service={heygenService}>
            <InteractiveAvatar />
          </ApiServiceProvider>
      </div>
    </div>
  );
}
