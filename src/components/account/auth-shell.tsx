import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/bits";

/** Shared frame for login / register / password pages. */
export function AuthShell({ title, sub, children, aside }: { title: string; sub?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <Container className="grid gap-8 py-8 sm:py-12 lg:grid-cols-[440px_1fr] lg:items-start lg:gap-12">
      <section className="board flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/brand/mascotte.png" alt="" width={56} height={56} className="rounded-full" />
          <div>
            <h1 className="display text-4xl">{title}</h1>
            {sub ? <p className="text-sm text-ink-600">{sub}</p> : null}
          </div>
        </div>
        {children}
      </section>
      <aside className="hidden lg:block">{aside}</aside>
    </Container>
  );
}
