"use client";

import { m } from "framer-motion";

const clients = ["شرکت آریا", "دکتر احمدی", "فروشگاه نوین", "مجموعه پارس", "آموزشگاه امید", "رستوران سنتی"];

export default function Clients() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-obsidian border-y border-gray-200 dark:border-white/5">
      <div className="container mx-auto px-6">
        <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <span className="text-xs font-bold text-gray-400 dark:text-white/30 tracking-widest uppercase">مشتریان ما</span>
        </m.div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center">
          {clients.map((client, i) => (
            <m.div key={client} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="text-center">
              <span className="text-sm font-bold text-gray-400 dark:text-white/20 hover:text-cyan/50 transition-colors cursor-default">{client}</span>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
