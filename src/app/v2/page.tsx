import type { Metadata } from "next";
import { checkoutEnabled } from "@/lib/payos";
import LandingV2 from "./landing";
import { LandingConversion } from "./landing-conversion";
import "@fontsource/lora/400-italic.css";
import "./landing.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Heros — Đi thật xa. An tâm thật gần.",
  description: "Một thiết bị nhỏ, một kết nối thật gần. Khám phá Heros: thiết bị SOS màu hồng phấn cùng bạn trong mỗi hành trình.",
};

export default function NewLandingPage() {
  return <LandingV2 conversion={<LandingConversion checkoutEnabled={checkoutEnabled()} />} />;
}
