import { Container, Skeleton } from "@/components/ui/bits";

export default function MenuLoading() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10" aria-busy="true" aria-label="Chargement du menu">
      <Skeleton className="h-12 w-56" />
      <Skeleton className="h-12 w-full max-w-xl rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="board overflow-hidden">
            <Skeleton className="aspect-[5/4] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
