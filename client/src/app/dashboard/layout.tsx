import BottomNav from "@/components/BottomNav";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-content">{children}</div>
      <BottomNav />
    </>
  );
}
