import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWizardData } from "@/lib/data/ads-engine";
import WizardForm from "@/components/advertise/WizardForm";

export const metadata: Metadata = {
  title: "ساخت کمپین تبلیغاتی",
  robots: { index: false, follow: false },
};

export default async function NewCampaignPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/advertise/new");

  const data = await getWizardData();

  return (
    <section className="py-32 bg-gray-50 dark:bg-obsidian min-h-screen">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-lalezar text-gray-900 dark:text-white mb-3">ساخت کمپین تبلیغاتی</h1>
          <p className="text-sm text-gray-500 dark:text-white/40">۴ قدم تا ثبت کمپین</p>
        </div>
        <WizardForm data={data} />
      </div>
    </section>
  );
}
