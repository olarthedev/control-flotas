import React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-[#f8fafc] min-h-screen overflow-x-hidden">
      
      {/* TopBar */}
      <div className="fixed top-0 left-0 w-full z-50">
        <TopBar />
      </div>

      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <main
        className="
          pt-[64px]
          pl-[240px]
        "
      >
        <div className="px-10 py-8 min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>

    </div>
  );
};