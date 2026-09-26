import { KeyRound, Tag, Eye, Headphones } from "lucide-react";

const reasons = [
  { icon: KeyRound, title: "مالکیت کامل", desc: "سایت را می‌خرید و صاحبش می‌شوید، نه اجاره." },
  { icon: Tag, title: "قیمت شفاف", desc: "قیمت هر سایت و هر امکان اضافه مشخص است." },
  { icon: Eye, title: "دیدن قبل از خرید", desc: "دموی زنده را در موبایل و دسکتاپ ببینید بعد بخرید." },
  { icon: Headphones, title: "همراه تا تحویل", desc: "از انتخاب تا تحویل و پشتیبانی کنارتان هستیم." },
];

export default function WhyLian() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-obsidian">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-cyan tracking-widest uppercase mb-3 block">چرا لیان دیزاین؟</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">خرید سایت، مثل خرید مطمئن</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((r) => (
            <div key={r.title} className="glass-card p-6 group hover:border-cyan/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center mb-4 group-hover:bg-cyan/20 transition-colors">
                <r.icon size={18} className="text-cyan" />
              </div>
               <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{r.title}</h3>
               <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
