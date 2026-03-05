import React, { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_STORAGE_KEY = "logi.sidebar.collapsed";
const SIDEBAR_EXPANDED_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const CONTENT_BASE_WIDTH = `calc(100dvw - ${SIDEBAR_EXPANDED_WIDTH}px)`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, isSidebarCollapsed ? "1" : "0");
    }
  }, [isSidebarCollapsed]);

  const sidebarWidth = useMemo(
    () => (isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH),
    [isSidebarCollapsed],
  );

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const isSidebarPreviewExpanded = isSidebarCollapsed && isSidebarHovered;
  const effectiveSidebarWidth = isSidebarPreviewExpanded ? SIDEBAR_EXPANDED_WIDTH : sidebarWidth;
  const isSidebarExpanded = !isSidebarCollapsed || isSidebarPreviewExpanded;

  return (
    <div className="bg-[#f8fafc] min-h-screen overflow-x-hidden">
      {/* TopBar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <TopBar
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
          sidebarWidth={sidebarWidth}
          effectiveSidebarWidth={effectiveSidebarWidth}
          isSidebarExpanded={isSidebarExpanded}
          onHoverChange={setIsSidebarHovered}
        />
      </div>

      {/* Sidebar fijo */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isExpanded={isSidebarExpanded}
        sidebarWidth={effectiveSidebarWidth}
        onHoverChange={setIsSidebarHovered}
      />

      {/* Contenido principal */}
      <main
        className="pt-[64px]"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <div
          className="px-10 py-8 min-h-[calc(100vh-64px)] mx-auto w-full"
          style={{ maxWidth: CONTENT_BASE_WIDTH }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};