import { getUserNotebooks } from "@/lib/data/notebook";
import { DashboardContent } from "./_components/dashboard-content";
import { Logo } from "@/app/(landing)/_components/logo";
import { Header } from "@/components/layout/header";
import { SortOption } from "@/api/shared/common.type";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; sort?: SortOption }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query;
  const sort = resolvedSearchParams.sort;

  const notebooks = await getUserNotebooks({ query, sort });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border/80 px-6 bg-card/40 backdrop-blur-md">
        <Logo />
        <Header />
      </header>
      <main className="flex-1">
        <DashboardContent notebooks={notebooks} />
      </main>
    </div>
  );
}
