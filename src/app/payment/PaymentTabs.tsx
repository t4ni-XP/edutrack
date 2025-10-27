"use client";
import { Tabs, Tab } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "受講料", value: "/payment/fee" },
  { label: "講師賃金", value: "/payment/wage" },
];

export default function PaymentTabs() {
  const pathname = usePathname();
  const active =
    tabs.find((tab) => pathname === tab.value || pathname.startsWith(`${tab.value}/`))?.value ??
    tabs[0].value;

  return (
    <Tabs value={active} aria-label="支払いタブ">
      {tabs.map((tab) => (
        <Tab key={tab.value} label={tab.label} value={tab.value} component={Link} href={tab.value} />
      ))}
    </Tabs>
  );
}
