"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import {
  ChevronDown,
  User,
  Info,
  Check,
  Menu,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ──────── Service Card Component ──────── */
interface ServiceCardProps {
  id: string;
  title: string;
  type: "premium" | "active" | "vip";
  features: { boldPart: string; normalPart?: string; subText?: string; isSpecial?: boolean }[];
  color: string;
  headerGradient: string;
  selectionGradient?: string;
  mascotSrc: string;
  overlaySrc?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ServiceCard = ({
  title,
  type,
  features,
  color,
  headerGradient,
  selectionGradient,
  mascotSrc,
  overlaySrc,
  isSelected,
  onSelect,
}: ServiceCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col rounded-[24px] md:rounded-[32px] overflow-hidden transition-all duration-500 w-full max-w-[320px] md:max-w-none h-[380px] md:h-[420px] cursor-pointer group shrink-0 ${isSelected ? "translate-y-[-8px]" : "hover:translate-y-[-4px]"
        }`}
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        boxShadow: isSelected ? `0 2px 4px ${color}33` : '0 2px 4px rgba(0,0,0,0.4)',
        border: isSelected ? `3px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header with Solid Color (72px Height) */}
      <div
        className="p-4 md:p-6 pt-5 md:pt-7 flex justify-between items-start h-[70px] md:h-[90px] relative overflow-hidden shrink-0"
        style={{ background: headerGradient }}
      >
        <div className="z-10">
          <h3 className="text-[16px] md:text-[22px] lg:text-2xl font-inter font-black text-white leading-tight tracking-tight">
            {title}
          </h3>
        </div>

        {/* Mascot Container (Pixel-Perfect Alignment) */}
        <div className="absolute right-4 md:right-6 bottom-[4px] pointer-events-none select-none">
          <div className="relative flex items-end justify-end">
            {overlaySrc && (
              <div className={`absolute z-20 ${type === 'active' ? 'top-[-12px] left-5' : 'top-[-10px] left-4'}`}>
                <Image
                  src={overlaySrc}
                  alt=""
                  width={type === 'active' ? 14 : 20}
                  height={type === 'active' ? 14 : 20}
                  className="object-contain drop-shadow-md"
                />
              </div>
            )}
            <div className="relative w-[44px] md:w-[64px] h-[48px] md:h-[68px]">
              <Image
                src={mascotSrc}
                alt={title}
                fill
                className="object-contain relative z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="px-5 py-6 md:px-8 md:py-8 flex-1 flex flex-col bg-[#161B3D]/50 backdrop-blur-sm">
        <ul className="space-y-[10px] md:space-y-[14px]">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3 md:gap-4">
              <div className={`mt-[4px] md:mt-[6px] rounded-full flex items-center justify-center shrink-0`}>
                <Check className="h-[14px] w-[14px] md:h-[18px] md:w-[18px] stroke-[4]" style={{ color }} />
              </div>
              <div className="flex flex-col">
                <div className={`text-[12px] md:text-[15.5px] leading-[1.4] md:leading-[1.6] tracking-tight ${feature.isSpecial ? '' : 'text-white'}`} style={{ color: feature.isSpecial ? color : undefined }}>
                  <span className={feature.isSpecial ? "font-black uppercase text-[11px] md:text-[13px] tracking-widest block mb-1" : "font-bold"}>{feature.boldPart}</span>
                  {feature.normalPart && <span className="font-medium text-white/70"> {feature.normalPart}</span>}
                </div>
                {feature.subText && (
                  <span className={`text-[10px] md:text-[12px] font-bold uppercase tracking-wider cursor-pointer underline-offset-4 decoration-2 opacity-90 transition-all hover:opacity-100 mt-0.5`} style={{ color, textDecorationColor: `${color}33` }}>
                    {feature.subText}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Selection Circle at Bottom Right (Pinned) */}
      <div
        className={`absolute bottom-4 right-3 md:bottom-5 md:right-6 w-5 h-5 md:w-7 md:h-7 rounded-full border-[1.5px] md:border-[2.5px] flex items-center justify-center transition-all duration-300 ${isSelected ? "shadow-inner scale-110" : "border-white/10 scale-100"
          }`}
        style={{
          background: isSelected ? (selectionGradient || color) : 'transparent',
          borderColor: isSelected ? (selectionGradient ? 'transparent' : color) : 'rgba(255,255,255,0.1)',
          borderWidth: isSelected && selectionGradient ? 0 : undefined
        }}
      >
        {isSelected && <Check className="h-3 w-3 md:h-5 md:w-5 text-white stroke-[4] md:stroke-[3]" />}
      </div>
    </div>
  );
};

/* ──────── Main Page Component ──────── */
export default function LandingPage() {
  const router = useRouter();
  const auth = useAuthContext();
  const [selectedPackage, setSelectedPackage] = useState<string>("admin");
  const [isVipToggle, setIsVipToggle] = useState(true);

  useEffect(() => {
    if (!auth) return;
    if (auth.initializing) return;

    // If authenticated, redirect away from landing page
    if (auth.user) {
      const role = (auth.user as any)?.role;
      if (role === 'CUSTOMER') {
        router.replace('/profile');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [auth, router]);

  // Selection logic: toggle between Admin & Customer Enterprise views
  const handleToggleVip = () => {
    const newState = !isVipToggle;
    setIsVipToggle(newState);
    setSelectedPackage(newState ? "admin" : "customer");
  };

  const handleSelectPackage = (id: string) => {
    setSelectedPackage(id);
    if (id === "admin") setIsVipToggle(true);
    if (id === "customer") setIsVipToggle(false);
  };

  if (!auth || auth.initializing || auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30 relative flex flex-col overflow-x-hidden font-sans">
      {/* 2. Topographic Mesh Accents (Left & Right) - Hidden on Mobile */}
      <div className="hidden lg:block z-0 overflow-hidden pointer-events-none">
        {/* Right Mesh - Elevated and Rotated */}
        <div className="absolute -right-48 top-9 w-[450px] aspect-square transition-opacity duration-1000">
          <Image src="/page-mesh.png" alt="" fill className="object-contain rotate-12" />
        </div>
        {/* Left Mesh - Mirrored and Lowered */}
        <div className="absolute -left-65 top-[30%] w-[400px] aspect-square transition-opacity duration-1000">
          <Image src="/page-mesh.png" alt="" fill className="object-contain -rotate-[35deg] scale-x-[-1] blur-[0.5px]" />
        </div>
      </div>

      {/* Dynamic Background Glows */}
      <div className="absolute top-[-100px] left-1/2 translate-x-[-50%] w-[800px] h-[400px] bg-[#0663CDA6] blur-[120px] rounded-[100%] pointer-events-none" />
      <div className="hidden lg:block absolute top-[25%] left-[-150px] w-[500px] h-[500px] bg-[#0663CDA6] blur-[100px] rounded-full pointer-events-none " />
      <div className="hidden lg:block absolute top-[40%] right-[-150px] w-[600px] h-[600px] bg-[#0663CDA6] blur-[120px] rounded-full pointer-events-none " />

      {/* ─── Navbar ─── */}
      <nav className="z-50 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between mx-auto w-full max-w-[1240px]">
        <div className="flex items-center gap-3 cursor-pointer transition-transform group hover:scale-105 active:scale-95">
          <div className="p-2.5 rounded-xl bg-white group-hover:bg-primary transition-all duration-300 shadow-lg shadow-primary/10 group-hover:shadow-primary/30">
            <Shield className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <div className="flex flex-col">
            <p className="font-black text-xl leading-none tracking-tight text-white italic">RBAC SYSTEM</p>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mt-1">Permission Platform</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {["DASHBOARD", "USERS", "LEADS", "ORDERS", "TASKS"].map((link) => (
            <Link key={link} href="/auth/login">
              <button className="flex items-center gap-1.5 text-[13px] font-bold tracking-widest text-[#94A3B8] hover:text-white transition-colors cursor-pointer">
                {link}
              </button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 mr-4">
            <span className="text-white text-[14px]">5.0</span>
            <div className="flex gap-[3px]">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-center w-[18px] h-[18px] rounded-[3px] bg-[lab(52_55.35_7.7)]">
                  <span className="text-[12px] text-white">★</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/auth/login">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-[lab(48.3522%_71.9362_17.7894)] transition-all font-bold text-[13px] tracking-wider text-white cursor-pointer">
              <User className="h-4 w-4" />
              LOGIN
            </button>
          </Link>

          <button className="lg:hidden p-2 text-white/70 hover:text-white transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <hr className="md:block opacity-20 border-[#0663CDA6]" />

      {/* ─── Hero Section ─── */}
      <main className="flex-1 flex flex-col items-center pt-3 pb-20 px-4 md:px-6 mx-auto w-full z-10 max-w-[1240px]">
        <div className="relative w-full flex flex-col items-center py-4 pb-12 overflow-visible">
          <div className="absolute inset-0 pointer-events-none select-none z-0">
            <Image
              src="/hero-grid.png"
              alt=""
              fill
              priority
              className="object-fill opacity-40 md:opacity-60"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center px-4">
            <h1 className="text-center mb-6 max-w-[900px] text-white font-[family:var(--font-rethink-sans)] font-bold text-[32px] md:text-[64px] leading-[1.05] tracking-tight mt-12 md:mt-20">
              Power Across Every Role.
              <br />
              Control <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#018DFF] to-[#00FFFF] drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">Every Click.</span>
            </h1>

            <p className="max-w-[760px] text-center text-white/50 font-medium text-[14px] md:text-[19px] leading-[1.6] md:leading-[1.7] tracking-normal mb-12 font-inter px-2">
              This is a multi-role web platform puts permissions at the core of everythings. From user visibility to
              page-level access and individual actions everything is dynamic. No page is locked; access is
              granted <span className="text-cyan-400 font-bold">atom by atom</span>, seamlessly cascading from Super Admin down to Customers.
            </p>

            <div
              onClick={handleToggleVip}
              className="relative flex items-center justify-start gap-3 md:gap-5 bg-white/5 backdrop-blur-md p-2 px-4 md:px-6 rounded-[30px] border border-white/10 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6),0_0_50px_rgba(6,99,205,0.25)] group transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6),0_0_60px_rgba(6,99,205,0.35)] cursor-pointer w-[320px] sm:w-[380px] md:w-[420px] max-w-[95vw] h-[52px] animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto"
            >
              <div className={`w-[44px] md:w-[56px] h-5 md:h-7 rounded-full p-1 transition-all flex items-center shrink-0 ${isVipToggle ? "bg-primary" : "bg-white/10"}`}>
                <div className={`bg-white w-3.5 md:h-5 md:w-5 h-3.5 rounded-full transition-all shadow-xl ${isVipToggle ? "translate-x-5 md:translate-x-7" : "translate-x-0"}`} />
              </div>
              <span className="flex-1 text-[10px] sm:text-[11px] md:text-[12px] font-black text-white tracking-[0.08em] md:tracking-widest select-none uppercase text-left leading-tight">
                {isVipToggle ? "Enterprise Control Admin" : "Enterprise Control Customer"}
              </span>
              <Info className="hidden sm:block h-4 md:h-5 w-4 md:w-5 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
            </div>
          </div>
        </div>

        {/* ─── Role Hierarchy Grid ─── */}
        <div className="relative w-full max-w-full md:max-w-[720px] lg:max-w-[1000px] mx-auto mb-20 font-sans pt-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 justify-items-center">
            <ServiceCard
              id="admin"
              title="Super Admin"
              type="premium"
              color="#00ADFF"
              headerGradient="linear-gradient(to bottom right, #0663CD, #01AAFF)"
              selectionGradient="linear-gradient(to bottom right, #0663CD, #01AAFF)"
              isSelected={selectedPackage === "admin"}
              onSelect={() => handleSelectPackage("admin")}
              mascotSrc="/premium-bird.png"
              features={[
                { boldPart: "Business Owner / IT Admin", isSpecial: true },
                { boldPart: "KEY POWER: Full System Autonomy", normalPart: "", isSpecial: true },
                { boldPart: "Complete control", normalPart: "over entire system" },
                { boldPart: "Manage all users", normalPart: "& Assign managers" },
                { boldPart: "Configure permissions", normalPart: "structure" },
                { boldPart: "Full overview", normalPart: "of all activity" },
              ]}
            />

            <ServiceCard
              id="manager"
              title="Team Manager"
              type="active"
              color="#E91E63"
              headerGradient="linear-gradient(to bottom right, #E11D48, #F43F5E)"
              isSelected={selectedPackage === "manager"}
              onSelect={() => handleSelectPackage("manager")}
              mascotSrc="/active-bird.png"
              overlaySrc="/star-icon.png"
              features={[
                { boldPart: "Team Lead / Dept Head", isSpecial: true },
                { boldPart: "KEY POWER: Atomic Delegation", normalPart: "", isSpecial: true },
                { boldPart: "Manage team", normalPart: "(agents + customers)" },
                { boldPart: "Agent feature", normalPart: "control & unlocking" },
                { boldPart: "Suspend or ban", normalPart: "users within scope" },
                { boldPart: "Real-time Messaging", normalPart: "" },
              ]}
            />

            <ServiceCard
              id="agent"
              title="Operational Agent"
              type="vip"
              color="#1DB954"
              headerGradient="linear-gradient(to bottom right, #10B981, #059669)"
              isSelected={selectedPackage === "agent"}
              onSelect={() => handleSelectPackage("agent")}
              mascotSrc="/vip-bird.png"
              overlaySrc="/crown-icon.png"
              features={[
                { boldPart: "Staff / Operator", isSpecial: true },
                { boldPart: "KEY POWER: Task-Only Focus", normalPart: "", isSpecial: true },
                { boldPart: "Work in unlocked", normalPart: "manager modules" },
                { boldPart: "Leads, Tasks, Reports", normalPart: "& Support" },
                { boldPart: "Access only", normalPart: "what's been granted" },
              ]}
            />

            <ServiceCard
              id="customer"
              title="Client Portal"
              type="premium"
              color="#A855F7"
              headerGradient="linear-gradient(to bottom right, #9333EA, #A855F7)"
              isSelected={selectedPackage === "customer"}
              onSelect={() => handleSelectPackage("customer")}
              mascotSrc="/premium-bird.png"
              features={[
                { boldPart: "End Client / User", isSpecial: true },
                { boldPart: "KEY POWER: Transparency", normalPart: "", isSpecial: true },
                { boldPart: "Own self-service", normalPart: "portal access" },
                { boldPart: "View tickets, orders", normalPart: "& interactions" },
                { boldPart: "No internal access", normalPart: "unless explicitly granted" },
                { boldPart: "Real-time Chat", normalPart: "with Support" },
              ]}
            />
          </div>
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 w-full mt-auto pt-20 pb-12 border-t border-white/5 bg-[#020617]/80 backdrop-blur-xl overflow-hidden">
        {/* Background Mesh for Footer */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0663CD]/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

        <div className="mx-auto max-w-[1240px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            {/* Branding Column */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="p-2 rounded-lg bg-white group-hover:bg-primary transition-all duration-300">
                  <Shield className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <p className="font-black text-lg leading-none tracking-tight text-white italic">RBAC SYSTEM</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Permission Platform</p>
                </div>
              </div>
              <p className="text-white/40 text-[14px] leading-[1.6] max-w-[280px]">
                The world's most granular multi-role permission system. Empowering teams to own every action and enable every user with atomic precision.
              </p>
              <div className="flex gap-4">
                {["/github.png", "/twitter.png", "/discord.png"].map((icon, idx) => (
                  <div key={idx} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                    <div className="w-5 h-5 bg-white/20 rounded-sm" />  {/* Placeholder for social icons */}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action Column (Customer Focused) */}
            <div className="lg:col-span-3 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 md:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md w-full">
              <div className="flex flex-col gap-4 text-center lg:text-left w-full lg:w-auto">
                <h4 className="text-white font-black text-2xl md:text-4xl tracking-tight leading-tight">Ready to Secure Your System?</h4>
                <p className="text-white/40 text-[16px] md:text-[18px] max-w-[480px]">
                  Join hundreds of businesses scaling safely with atomic permissions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 md:px-10 py-4 rounded-full bg-white text-[#020617] font-black text-[14px] md:text-[15px] hover:bg-neutral-200 transition-all cursor-pointer shadow-xl min-w-max whitespace-nowrap">
                    <User className="h-5 w-5" />
                    LOGIN
                  </button>
                </Link>
                <Link href="/auth/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 md:px-10 py-4 rounded-full bg-primary text-white font-black text-[14px] md:text-[15px] hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all cursor-pointer min-w-max whitespace-nowrap">
                    CUSTOMER REGISTER
                    <ArrowRight className="h-5 w-5 shrink-0" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/20 text-[13px] font-medium tracking-wide">
              © {new Date().getFullYear()} RBAC Dynamic Permission System. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <span className="text-white/20 text-[13px] font-medium hover:text-white/40 transition-colors cursor-pointer">Privacy</span>
              <span className="text-white/20 text-[13px] font-medium hover:text-white/40 transition-colors cursor-pointer">Terms</span>
              <span className="text-white/20 text-[13px] font-medium hover:text-white/40 transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
