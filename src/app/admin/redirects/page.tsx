import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import RedirectsManager from "./RedirectsManager";
import { Page, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminRedirectsPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/login");

  const redirects = await prisma.redirect.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <Page>
      <PageHeader
        kicker={
          <Link href="/admin" className="hover:text-foreground">
            Admin
          </Link>
        }
        title="Redirects"
        description="Redirects are created automatically when an article slug is renamed. You can also add manual redirects here."
      />

      <RedirectsManager initialRedirects={redirects} />
    </Page>
  );
}
