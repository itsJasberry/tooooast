"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useParams } from "next/navigation";
import { ChangeEvent, ReactNode, useTransition } from "react";

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({
  children,
  defaultValue,
  label,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    startTransition(() => {
      // @ts-ignore
      router.replace({ pathname, params }, { locale: nextLocale });
    });
  }

  return (
    <label
      className={cn(
        "relative text-gray-400",
        isPending && "transition-opacity [&>disabled]:opacity-30"
      )}>
      <p className="sr-only">{label}</p>
      <select
        className="inline-flex appearance-none bg-transparent py-3 pl-2 pr-6"
        defaultValue={defaultValue}
        disabled={isPending}
        onChange={onSelectChange}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-2 top-2 rotate-180">
        ^
      </span>
    </label>
  );
}
