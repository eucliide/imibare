import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="flex-1 pt-16">{children}</div>
    </>
  );
}
