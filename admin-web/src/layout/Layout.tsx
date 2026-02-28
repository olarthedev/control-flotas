import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-6 overflow-y-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};