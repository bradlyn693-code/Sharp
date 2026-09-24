import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { Toaster, toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Database,
  ExternalLink,
  HardDrive,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Plus,
  Search,
  Server,
  Settings,
  Tv,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PURPLE = "#7c3aed";

const plans = [
  {
    name: "Unlimited",
    price: "250.00",
    currency: "KES",
    subtitle: "No caps on RAM, disk, or CPU.",
    specs: [
      ["Memory", "Unlimited"],
      ["Disk", "Unlimited"],
      ["CPU", "Unlimited"],
      ["Databases", "10"],
      ["Backups", "10"],
    ],
    accent: "rose",
    popular: false,
  },
  {
    name: "Admin Panel",
    price: "550.00",
    currency: "KSH",
    subtitle: "Full admin access + extra resources.",
    specs: [["Memory", "Unlimited"], ["Disk", "Unlimited"], ["CPU", "Unlimited"], ["Databases", "Unlimited"], ["Backups", "Unlimited"]],
    accent: "rose",
    popular: false,
    isAdmin: true,
    features: ["👑 Full Pterodactyl Admin Access", "♾️ Unlimited RAM / Disk / CPU", "👥 Create Unlimited Users & Servers", "🔧 Manage All Nodes & Locations", "📊 Advanced Analytics & Logs", "🛡️ Ban / Suspend Users", "💰 Revenue & Billing Control", "🔌 Install Eggs & Plugins", "🚀 Priority Support 24/7", "🎨 Custom Theme + Branding"],
  },
] as const;

const vpsPlans = [
  { id: "vps-8", emoji: "🎱", name: "VPS 8GB RAM", ram: "8GB", price: "980", vcpu: "2 vCPU", storage: "50GB NVMe SSD", bandwidth: "2TB Transfer", ip: "1 Dedicated IP", desc: "Perfect for small businesses, WordPress sites & starter game servers.", bestFor: "Best for: Blogs, Small E-commerce, Minecraft 20 players", features: ["2 vCPU Xeon", "50GB NVMe SSD", "2TB Bandwidth", "DDoS Protection", "Instant Deploy"], popular: false },
  { id: "vps-12", emoji: "🏈", name: "VPS 12GB RAM", ram: "12GB", price: "1600", vcpu: "3 vCPU", storage: "80GB NVMe SSD", bandwidth: "3TB Transfer", ip: "1 Dedicated IP", desc: "Balanced power for growing communities and medium traffic apps.", bestFor: "Best for: GTA Roleplay, Medium Businesses, WooCommerce", features: ["3 vCPU Xeon", "80GB NVMe SSD", "3TB Bandwidth", "Daily Backups", "Root Access"], popular: false },
  { id: "vps-24", emoji: "⚾", name: "VPS 24GB RAM", ram: "24GB", price: "3500", vcpu: "6 vCPU", storage: "150GB NVMe SSD", bandwidth: "5TB Transfer", ip: "1 Dedicated IP + IPv6", desc: "High-performance workhorse — our most popular VPS for serious workloads.", bestFor: "Best for: Large MC Networks, SaaS Apps, High-Traffic Sites", features: ["6 vCPU Xeon Gold", "150GB NVMe SSD", "5TB Bandwidth", "Priority Support", "Free cPanel"], popular: true },
  { id: "vps-48", emoji: "🏓", name: "VPS 48GB RAM", ram: "48GB", price: "4900", vcpu: "8 vCPU", storage: "300GB NVMe SSD", bandwidth: "Unmetered", ip: "2 Dedicated IPs", desc: "Enterprise-grade power for resource-heavy applications & virtualization.", bestFor: "Best for: Dedicated Game Hosting, Enterprise Apps, Video Streaming", features: ["8 vCPU Xeon Gold", "300GB NVMe SSD", "Unmetered Bandwidth", "24/7 Phone Support", "Free Migration"], popular: false },
  { id: "vps-64", emoji: "⛳", name: "VPS 64GB RAM", ram: "64GB", price: "6000", vcpu: "12 vCPU", storage: "500GB NVMe SSD", bandwidth: "Unmetered", ip: "3 Dedicated IPs", desc: "Ultimate performance — no limits. Bare-metal like power in a VPS.", bestFor: "Best for: Large Enterprises, Private Cloud, Heavy Virtualization", features: ["12 vCPU Xeon Platinum", "500GB NVMe SSD", "Unmetered + 10Gbps Port", "Dedicated Support Agent", "Custom ISO"], popular: false },
] as const;

const navItems: { label: string; href: string; icon: LucideIcon; emoji?: string; soon?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, emoji: "🏠" },
  { label: "VPS", href: "/vps", icon: Cloud, emoji: "🖥️" },
  { label: "Channels", href: "/channels", icon: Tv, emoji: "📺" },
  { label: "Foreign Numbers", href: "/foreign-numbers", icon: Globe2, emoji: "🌍" },
  { label: "Online Jobs", href: "/online-jobs", icon: BriefcaseBusiness, emoji: "✍️" },
  { label: "My Servers", href: "/servers", icon: Server, emoji: "🕋" },
  { label: "Wallet", href: "/wallet", icon: WalletCards, emoji: "🏛" },
  { label: "Deployments", href: "#", icon: Zap, soon: true },
  { label: "Analytics", href: "#", icon: BarChart3, soon: true },
  { label: "Settings", href: "#", icon: Settings, soon: true },
];

function isLoggedIn() {
  return typeof window !== "undefined" && (localStorage.getItem("fluxy_logged") === "true" || sessionStorage.getItem("fluxy_logged") === "true");
}

function activatePlan({ name, price, ram, type }: { name: string; price: string; ram: string; type: string }) {
  const balance = Number(localStorage.getItem("fluxy_balance") || "0");
  const amount = Number(price);
  if (balance < amount) return { success: false, balance };
  const servers = JSON.parse(localStorage.getItem("fluxy_servers") || "[]");
  servers.push({ id: Date.now(), plan: name, ram, price, date: new Date().toLocaleDateString(), type });
  localStorage.setItem("fluxy_servers", JSON.stringify(servers));
  localStorage.setItem("fluxy_balance", (balance - amount).toFixed(2));
  localStorage.setItem("fluxy_paid_plan", name);
  return { success: true, balance: balance - amount };
}

function CloudMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-hidden="true">
      <Cloud size={small ? 17 : 20} strokeWidth={2.5} />
      <span className="brand-sparkle">✦</span>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3" aria-label="Fluxy Tech dashboard">
      <CloudMark small={compact} />
      {!compact && (
        <span className="brand-wordmark">
          Fluxy<span>Tech</span>
        </span>
      )}
    </Link>
  );
}

function AuthShell({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="auth-page min-h-screen bg-[#0f0a1a] text-white">
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <div className="auth-noise" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1320px] flex-col px-6 py-7 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Brand />
          <div className="hidden items-center gap-2 text-xs font-medium text-[#8b7aaa] sm:flex">
            <ShieldCheck size={15} className="text-[#a855f7]" /> Secure workspace
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center py-14">
          <div className="grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[1fr_420px] lg:gap-24">
            <div className="hidden lg:block">
              <p className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</p>
              <h1 className="mt-6 max-w-xl font-display text-6xl font-semibold leading-[1.02] tracking-[-0.045em] text-white">
                Infrastructure that feels <em>effortless.</em>
              </h1>
              <p className="mt-7 max-w-md text-base leading-7 text-[#a99bc7]">
                Provision powerful, reliable servers in seconds. Fluxy gives teams a calm, beautiful place to build what is next.
              </p>
              <div className="mt-10 flex items-center gap-6 text-xs text-[#8b7aaa]">
                <span className="flex items-center gap-2"><span className="status-dot" /> 99.99% network uptime</span>
                <span className="flex items-center gap-2"><LockKeyhole size={14} /> SOC2-ready controls</span>
              </div>
            </div>
            <div className="auth-card relative rounded-[24px] p-7 sm:p-9">
              <div className="mb-8 lg:hidden">
                <p className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</p>
              </div>
              <div className="mb-7">
                <h2 className="font-display text-3xl font-semibold tracking-[-0.035em] text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#9a8ab8]">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </main>
        <footer className="flex items-center justify-between border-t border-white/[0.06] pt-5 text-[11px] text-[#6f6385]">
          <span>© 2026 Fluxy Technologies</span>
          <span className="hidden items-center gap-3 sm:flex"><a href="#" onClick={(e) => e.preventDefault()}>Privacy</a><a href="#" onClick={(e) => e.preventDefault()}>Terms</a><CircleHelp size={14} /></span>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange }: { label: string; type?: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#c0b3d9]">{label}</span>
      <input className="input-dark" type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  );
}

type StoredAccount = { name: string; email: string; password: string };

function getStoredAccounts(): StoredAccount[] {
  try {
    return JSON.parse(localStorage.getItem("fluxy_accounts") || "[]") as StoredAccount[];
  } catch {
    return [];
  }
}

function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(localStorage.getItem("fluxy_email") ?? "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(localStorage.getItem("fluxy_remember") !== "false");

  useEffect(() => {
    if (isLoggedIn()) navigate("/dashboard");
  }, [navigate]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const account = getStoredAccounts().find((item) => item.email === normalizedEmail && item.password === password);
    if (!account) {
      toast.error("Account not found", { description: "Create an account first or check your email and password." });
      return;
    }
    localStorage.removeItem("fluxy_logged");
    sessionStorage.removeItem("fluxy_logged");
    if (remember) {
      localStorage.setItem("fluxy_logged", "true");
      localStorage.setItem("fluxy_remember", "true");
      localStorage.setItem("fluxy_email", account.email);
    } else {
      sessionStorage.setItem("fluxy_logged", "true");
      localStorage.setItem("fluxy_remember", "false");
      localStorage.removeItem("fluxy_email");
    }
    localStorage.setItem("fluxy_name", account.name);
    localStorage.setItem("fluxy_login_time", Date.now().toString());
    sessionStorage.setItem("fluxy_login_time", Date.now().toString());
    navigate("/dashboard");
    toast.success("Welcome back to Fluxy Tech", { description: remember ? "You will stay signed in on this device." : "You are signed in for this session." });
  }

  return (
    <AuthShell eyebrow="The cloud, clarified" title="Welcome back" subtitle="Sign in to your dashboard and keep building at the speed of your ideas.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email address" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
        <div>
          <Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
          <div className="mt-3 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-[#8b7aaa]"><input type="checkbox" className="purple-checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
            <Link href="/reset-password" className="font-semibold text-[#b47cff] transition-colors hover:text-white">Forgot password?</Link>
          </div>
        </div>
        <button className="primary-button mt-3 w-full" type="submit">Sign in &amp; Stay Logged <ArrowRight size={16} /></button>
      </form>
      <p className="mt-7 text-center text-sm text-[#8b7aaa]">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-[#c08aff] hover:text-white">Create one</Link></p>
    </AuthShell>
  );
}

function SignupPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const accounts = getStoredAccounts();
    if (accounts.some((item) => item.email === normalizedEmail)) {
      toast.error("Account already exists", { description: "Sign in with this email or use a different email address." });
      return;
    }
    accounts.push({ name: normalizedName, email: normalizedEmail, password });
    localStorage.setItem("fluxy_accounts", JSON.stringify(accounts));
    localStorage.setItem("fluxy_logged", "true");
    sessionStorage.setItem("fluxy_logged", "true");
    localStorage.setItem("fluxy_remember", "true");
    localStorage.setItem("fluxy_email", normalizedEmail);
    localStorage.setItem("fluxy_name", normalizedName);
    navigate("/dashboard");
    toast.success("Your Fluxy workspace is ready");
  }

  return (
    <AuthShell eyebrow="Start shipping" title="Create your workspace" subtitle="Set up your account and get a production-ready server in minutes.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Your name" placeholder="Alex Morgan" value={name} onChange={setName} />
        <Field label="Work email" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
        <Field label="Create password" type="password" placeholder="At least 8 characters" value={password} onChange={setPassword} />
        <button className="primary-button mt-3 w-full" type="submit">Create account <ArrowRight size={16} /></button>
      </form>
      <p className="mt-7 text-center text-sm text-[#8b7aaa]">Already have an account? <Link href="/login" className="font-semibold text-[#c08aff] hover:text-white">Sign in</Link></p>
    </AuthShell>
  );
}

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    toast.success("Reset link sent", { description: `Check ${email || "your inbox"} for next steps.` });
  }
  return (
    <AuthShell eyebrow="Back in control" title="Reset your password" subtitle="Enter your workspace email and we’ll send you a secure reset link.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email address" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
        <button className="primary-button mt-3 w-full" type="submit">Send reset link <ArrowRight size={16} /></button>
      </form>
      <p className="mt-7 text-center text-sm text-[#8b7aaa]"><Link href="/login" className="inline-flex items-center gap-2 font-semibold text-[#c08aff] hover:text-white"><ArrowLeft size={14} /> Back to sign in</Link></p>
    </AuthShell>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const allowed = isLoggedIn();
  useEffect(() => {
    if (!allowed) navigate("/login");
  }, [allowed, navigate]);
  return allowed ? <>{children}</> : <div className="min-h-screen bg-[#0f0a1a]" />;
}

function Sidebar({ mobileOpen, closeMobile, collapsed, toggleCollapsed }: { mobileOpen: boolean; closeMobile: () => void; collapsed: boolean; toggleCollapsed: () => void }) {
  const [location, navigate] = useLocation();
  function signOut() {
    localStorage.removeItem("fluxy_logged");
    localStorage.removeItem("fluxy_login_time");
    sessionStorage.removeItem("fluxy_logged");
    if (localStorage.getItem("fluxy_remember") !== "true") {
      localStorage.removeItem("fluxy_email");
    }
    navigate("/login");
    toast.success("You have been signed out");
  }
  return (
    <>
      {mobileOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-[#050309]/70 backdrop-blur-sm lg:hidden" onClick={closeMobile} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#2d1f4e] bg-[#0a0612] px-4 py-5 transition-[width,transform,padding] duration-200 lg:translate-x-0 ${collapsed ? "sidebar-collapsed lg:w-[82px] lg:px-3" : ""} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`mb-8 flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-3"}`}><Brand compact={collapsed} /><button onClick={() => { if (window.matchMedia("(min-width: 1024px)").matches) toggleCollapsed(); else closeMobile(); }} className="icon-button" aria-label={mobileOpen ? "Close sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"} title={mobileOpen ? "Close sidebar" : collapsed ? "Expand sidebar" : "Collapse sidebar"}>{mobileOpen ? <X size={17} /> : collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button></div>
        <div className="sidebar-section mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e5273]">Workspace</div>
        <nav className="space-y-1">
          {navItems.slice(0, 7).map((item) => {
            const active = location === item.href || (item.href === "/dashboard" && location === "/");
            return <Link key={item.label} href={item.href} onClick={closeMobile} className={`nav-item ${active ? "nav-item-active" : ""}`}><span aria-hidden="true" className="text-[15px] leading-none">{item.emoji}</span><span className="sidebar-label">{item.label}</span>{active && <span className="nav-active-line" />}</Link>;
          })}
        </nav>
        <div className="sidebar-section mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e5273]">Manage</div>
        <nav className="space-y-1">
          {navItems.slice(7).map((item) => <button key={item.label} onClick={() => toast.info(`${item.label} is coming soon`, { description: "We’re polishing this part of your workspace." })} className="nav-item w-full text-left"><item.icon size={17} strokeWidth={1.8} /><span className="sidebar-label">{item.label}</span><span className="sidebar-label ml-auto text-[9px] font-semibold uppercase tracking-wider text-[#5d5174]">Soon</span></button>)}
        </nav>
        <div className="mt-auto sidebar-user-area">
          <button onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#b17183] transition-colors hover:bg-[#2a101d] hover:text-[#ef92a6]"><LogOut size={15} /><span className="sidebar-label">Sign out</span></button>
        </div>
      </aside>
    </>
  );
}

function AppHeader({ title, subtitle, onMenu }: { title: string; subtitle?: string; onMenu: () => void }) {
  const [noticeOpen, setNoticeOpen] = useState(false);
  return <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><button className="icon-button mt-1 lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu size={19} /></button><div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#806f9b]"><span className="h-1.5 w-1.5 rounded-full bg-[#a855f7]" /> Fluxy workspace</div><h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[36px]">{title}</h1>{subtitle && <p className="mt-2 text-sm text-[#877a9f]">{subtitle}</p>}</div></div><div className="flex items-center gap-2 self-end sm:self-start"><label className="search-field"><Search size={15} /><input placeholder="Search" aria-label="Search" /></label><div className="relative"><button className="icon-button" aria-label="Notifications" onClick={() => setNoticeOpen((value) => !value)}><Bell size={17} /><span className="notification-dot" /></button>{noticeOpen && <div className="notice-popover"><p className="text-xs font-semibold text-white">Notifications</p><p className="mt-1 text-[11px] leading-5 text-[#8e80a5]">You’re all caught up. New activity will appear here.</p></div>}</div><button className="icon-button hidden sm:flex" aria-label="More options"><MoreHorizontal size={18} /></button></div></header>;
}

function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { const openMenu = () => setMobileOpen(true); window.addEventListener("fluxy:open-menu", openMenu); return () => window.removeEventListener("fluxy:open-menu", openMenu); }, []);
  return <div className="min-h-screen bg-[#0f0a1a] text-white"><Sidebar mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} collapsed={collapsed} toggleCollapsed={() => setCollapsed((value) => !value)} /><main className={`dashboard-main min-h-screen px-5 py-6 sm:px-8 ${collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"} lg:px-10 lg:py-9 xl:px-14`}><div className="mx-auto max-w-[1360px]">{children}</div></main><Toaster theme="dark" toastOptions={{ style: { background: "#1a102e", border: "1px solid #3a2863", color: "#fff" } }} /></div>;
}
function StatCard({ icon: Icon, label, value, meta, progress }: { icon: LucideIcon; label: string; value: string; meta: string; progress?: number }) {
  return <div className="stat-card"><div className="flex items-start justify-between"><div className="stat-icon"><Icon size={17} /></div>{progress !== undefined && <span className="text-[11px] font-semibold text-[#a855f7]">{progress}%</span>}</div><p className="mt-5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#796d93]">{label}</p><p className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-white">{value}</p><p className="mt-1 text-[11px] text-[#837597]">{meta}</p>{progress !== undefined && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#2d1f4e]"><div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc]" style={{ width: `${progress}%` }} /></div>}</div>;
}

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const [, navigate] = useLocation();
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "activated">("idle");
  function markPaid() {
    if (paymentState === "processing" || paymentState === "activated") return;
    setPaymentState("processing");
    window.setTimeout(() => {
      const result = activatePlan({ name: plan.name, price: plan.price, ram: String(plan.specs[0]?.[1] || "Unlimited"), type: "Plan" });
      if (result.success) {
        setPaymentState("activated");
        toast.success(`${plan.name} activated`, { description: "The plan was added to My Servers." });
      } else {
        setPaymentState("idle");
        toast.error("Insufficient wallet balance", { description: `Add funds before activating the ${plan.name} plan.` });
      }
    }, 700);
  }
  function buy() {
    localStorage.setItem("fluxy_selected_plan", plan.name);
    toast.success(`${plan.name} plan selected`, { description: "Your plan is ready to activate from the wallet." });
    navigate("/wallet");
  }
  return <article className={`plan-card ${plan.popular ? "plan-card-popular" : ""} ${"isAdmin" in plan && plan.isAdmin ? "plan-card-admin" : ""}`}>
    {plan.popular && <div className="popular-badge"><Sparkles size={12} /> MOST POPULAR</div>}{"isAdmin" in plan && plan.isAdmin && <div className="admin-badge">👑 ADMIN ACCESS</div>}
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`plan-orb plan-orb-${plan.accent}`} /><h3 className="text-[18px] font-semibold text-white">{plan.name}</h3></div><p className="mt-2 min-h-[36px] text-xs leading-5 text-[#8f82a4]">{plan.subtitle}</p></div><button className="plan-more" aria-label={`${plan.name} details`}><MoreHorizontal size={16} /></button></div>
    <div className="mt-5 flex items-end gap-1"><span className="text-xs font-semibold text-[#8b7aaa]">{plan.currency}</span><span className="font-display text-[28px] font-semibold tracking-[-0.045em] text-white">{plan.price}</span><span className="mb-1 text-[11px] text-[#776a8f]">/ monthly</span></div>
    <div className="my-5 h-px bg-[#2d1f4e]" />
    <div className="space-y-3">{plan.specs.map(([label, value]) => <div key={label} className="flex items-center justify-between text-xs"><span className="text-[#887b9d]">{label}</span><span className="font-medium text-[#eee8fb]">{value}</span></div>)}</div>{"features" in plan && plan.features && <div className="admin-features">{plan.features.slice(0, 4).map((feature) => <span key={feature}>{feature}</span>)}<span className="admin-feature-more">+6 more admin capabilities</span></div>}
    <div className="plan-actions mt-6"><button onClick={buy} className={`buy-button w-full ${plan.popular ? "buy-button-featured" : ""}`}>Buy now <ArrowRight size={14} /></button><button onClick={markPaid} disabled={paymentState !== "idle"} className="paid-button w-full">{paymentState === "processing" ? "Processing..." : paymentState === "activated" ? "Activated" : "I have paid"} {paymentState === "activated" ? <Check size={14} /> : null}</button></div>
  </article>;
}

function DashboardPage() {
  const [query, setQuery] = useState("");
  const filteredPlans = useMemo(() => plans.filter((plan) => `${plan.name} ${plan.subtitle}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <DashboardLayout><AppHeader title="Pricing & Plans" subtitle="Choose the perfect plan for your infrastructure · Upgrade anytime, cancel anytime" onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} /><div className="mb-7 grid gap-4 md:grid-cols-2"><StatCard icon={Server} label="Active servers" value="0 / 20" meta="No active servers" /><StatCard icon={WalletCards} label="Wallet balance" value="KES 0.00" meta="Available for renewals" /></div><section><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Pick your capacity</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white">Plans that scale with you</h2></div><label className="dashboard-filter"><Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter plans" /></label></div><div className="plan-grid">{filteredPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</div>{filteredPlans.length === 0 && <div className="empty-search"><Search size={22} /><p>No plans match “{query}”.</p></div>}</section></DashboardLayout>;
}


function VpsPage() {
  const [, navigate] = useLocation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activatedId, setActivatedId] = useState<string | null>(null);

  function markPaid(plan: (typeof vpsPlans)[number]) {
    if (processingId || activatedId === plan.id) return;
    setProcessingId(plan.id);
    window.setTimeout(() => {
      const result = activatePlan({ name: plan.name, price: plan.price, ram: plan.ram, type: "VPS" });
      setProcessingId(null);
      if (result.success) {
        setActivatedId(plan.id);
        toast.success(`${plan.name} activated`, { description: "The VPS was added to My Servers." });
      } else {
        toast.error("Insufficient wallet balance", { description: `Add funds before activating the ${plan.name} plan.` });
      }
    }, 700);
  }
  function choosePlan(plan: (typeof vpsPlans)[number]) {
    localStorage.setItem("fluxy_pending_vps", JSON.stringify({ name: plan.name, ram: plan.ram, price: plan.price }));
    toast.success("Plan ready in Wallet", { description: "Complete funding from the Wallet checkout." });
    navigate("/wallet");
  }

  return <DashboardLayout><AppHeader title="VPS" subtitle="NVMe SSD · DDoS protected · Instant setup · Kenya location" onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow"><span className="eyebrow-dot" /> Virtual private servers</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white">Power without the complexity</h2></div><span className="hidden items-center gap-2 text-xs text-[#8b7aaa] sm:flex"><span className="status-dot" /> All systems operational</span></div>
    <div className="vps-grid">{vpsPlans.map((plan) => <article key={plan.id} className={`vps-card ${plan.popular ? "vps-card-popular" : ""}`}>{plan.popular && <div className="vps-popular"><Sparkles size={12} /> POPULAR</div>}<div className="flex items-start gap-3"><div className="vps-emoji">{plan.emoji}</div><div><h3 className="text-[18px] font-bold text-white">{plan.name}</h3><p className="mt-1 text-xs text-[#a855f7]">{plan.vcpu} · {plan.storage}</p></div></div><div className="mt-5 flex items-baseline gap-2"><span className="font-display text-[27px] font-semibold tracking-[-0.04em] text-white">KSH {plan.price}</span><span className="text-xs text-[#6b5a8a]">/ monthly</span></div><p className="mt-2 min-h-[40px] text-[13px] leading-5 text-[#b8a9d9]">{plan.desc}</p><div className="mt-4 rounded-[10px] border border-[#2d1f4e]/70 bg-[#0f0a1a] px-3 py-2"><p className="text-[11px] font-semibold text-[#c084fc]">{plan.bestFor}</p></div><div className="my-4 h-px bg-[#2d1f4e]" /><div className="mb-5 flex-1 space-y-3"><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">RAM</span><span className="text-[13px] font-bold text-white">{plan.ram} DDR4</span></div><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">Disk</span><span className="text-[13px] text-white">{plan.storage}</span></div><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">Bandwidth</span><span className="text-[13px] text-white">{plan.bandwidth}</span></div></div><div className="plan-actions"><button onClick={() => choosePlan(plan)} className={`buy-button w-full ${plan.popular ? "buy-button-featured" : ""}`}>CONTINUE TO WALLET · KSH {plan.price}</button><button onClick={() => markPaid(plan)} disabled={processingId !== null || activatedId === plan.id} className="paid-button w-full">{processingId === plan.id ? "Processing..." : activatedId === plan.id ? "Activated" : "I have paid"} {activatedId === plan.id ? <Check size={14} /> : null}</button></div></article>)}</div>
  </DashboardLayout>;
}

function ServersPage() {
  const servers = JSON.parse(localStorage.getItem("fluxy_servers") || "[]") as { id: number; plan: string; ram: string; price: string; date: string; type: string }[];
  return <DashboardLayout><AppHeader title="My Servers" subtitle="Keep an eye on every environment from one calm workspace." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />{servers.length === 0 ? <div className="empty-panel"><div className="server-illustration"><div className="server-rack"><span /><span /><span /></div><div className="server-pulse" /></div><h2 className="mt-7 font-display text-2xl font-semibold tracking-[-0.035em] text-white">No servers yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#877a9f]">Your infrastructure will show up here once you activate your first plan. Ready when you are.</p><Link href="/vps" className="primary-button mt-7">Explore plans <ArrowRight size={15} /></Link></div> : <div><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Provisioned infrastructure</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Your active servers</h2></div><Link href="/vps" className="primary-button">Add server <Plus size={15} /></Link></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{servers.map((server) => <div key={server.id} className="server-card"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="server-status-icon"><Server size={17} /></div><div><h3 className="text-sm font-semibold text-white">{server.plan}</h3><p className="mt-1 text-[11px] text-[#807294]">{server.type} · {server.date}</p></div></div><span className="status-pill">Active</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4"><div><p className="text-[10px] uppercase tracking-wider text-[#766a8c]">Memory</p><p className="mt-1 text-sm font-semibold text-white">{server.ram} DDR4</p></div><div><p className="text-[10px] uppercase tracking-wider text-[#766a8c]">Monthly</p><p className="mt-1 text-sm font-semibold text-white">KSH {server.price}</p></div></div></div>)}</div></div>}</DashboardLayout>;
}

function ChannelsPage() {
  const plans = [
    { id: "2k", label: "2k followers 🛸", price: "850" },
    { id: "5k", label: "5k followers 🏈", price: "1300" },
    { id: "7k", label: "7k followers ⛵", price: "2200" },
  ];
  const [showPay, setShowPay] = useState<(typeof plans)[number] | null>(null);

  function pay() {
    if (!showPay) return;
    const result = activatePlan({ name: showPay.label, price: showPay.price, ram: "—", type: "Channel" });
    if (!result.success) {
      toast.error("Insufficient wallet balance", { description: `Add KES ${(Number(showPay.price) - result.balance).toFixed(2)} to purchase this channel plan.` });
      return;
    }
    setShowPay(null);
    toast.success("Channel plan activated", { description: `${showPay.label} is now available in My Servers.` });
  }

  return <DashboardLayout><AppHeader title="Channels" subtitle="Grow your audience with ready-to-activate channel plans." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6"><p className="eyebrow"><span className="eyebrow-dot" /> Audience growth</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">Channel plans</h2><p className="mt-2 text-sm text-[#877a9f]">Choose a follower package and activate it from your wallet balance.</p></div>
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((plan) => <div key={plan.id} className="plan-card group text-center"><div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#24133f] text-2xl transition-transform duration-200 group-hover:-translate-y-1">{plan.label.split(" ").at(-1)}</div><h3 className="text-base font-bold text-white">{plan.label.slice(0, -2)}</h3><p className="mt-3 font-display text-3xl font-semibold text-white"><span className="mr-1 text-xs font-medium text-[#8a7ca1]">KES</span>{plan.price}</p><button onClick={() => setShowPay(plan)} className="primary-button mt-6 w-full">Buy now <ArrowRight size={15} /></button></div>)}
      </div>
    </div>
    {showPay && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><button aria-label="Close channel payment modal" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPay(null)} /><div className="relative w-full max-w-[360px] rounded-[20px] border border-[#2d1f4e] bg-[#1a102e] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"><button onClick={() => setShowPay(null)} className="icon-button absolute right-4 top-4" aria-label="Close channel payment modal"><X size={15} /></button><div className="mb-5 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-2xl">📺</div><h3 className="text-base font-bold text-white">{showPay.label}</h3><p className="mt-1 text-sm text-[#a99abb]">KES {showPay.price}</p></div><div className="flex gap-3"><button onClick={() => setShowPay(null)} className="secondary-button flex-1">Cancel</button><button onClick={pay} className="primary-button flex-1">Pay KES {showPay.price}</button></div></div></div>}
  </DashboardLayout>;
}

function ForeignNumbersPage() {
  const numbers = [
    { id: "usa", country: "USA", flag: "🇺🇸", price: "750", code: "+1" },
    { id: "uk", country: "UK", flag: "🇬🇧", price: "600", code: "+44" },
    { id: "canada", country: "Canada", flag: "🇨🇦", price: "500", code: "+1" },
    { id: "germany", country: "Germany", flag: "🇩🇪", price: "650", code: "+49" },
    { id: "netherlands", country: "Netherlands", flag: "🇳🇱", price: "600", code: "+31" },
    { id: "australia", country: "Australia", flag: "🇦🇺", price: "750", code: "+61" },
  ];
  const [showPay, setShowPay] = useState<(typeof numbers)[number] | null>(null);

  function pay() {
    if (!showPay) return;
    const result = activatePlan({ name: `${showPay.country} number ${showPay.code}`, price: showPay.price, ram: "—", type: "Foreign Number" });
    if (!result.success) {
      toast.error("Insufficient wallet balance", { description: `Add KES ${(Number(showPay.price) - result.balance).toFixed(2)} to purchase this number.` });
      return;
    }
    setShowPay(null);
    toast.success("Foreign number activated", { description: `${showPay.country} ${showPay.code} is now available in My Servers.` });
  }

  return <DashboardLayout><AppHeader title="Foreign Numbers" subtitle="Choose a virtual number for your global operations." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6"><p className="eyebrow"><span className="eyebrow-dot" /> Global reach</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">International numbers</h2><p className="mt-2 text-sm text-[#877a9f]">Pick a country and activate a virtual number using your wallet balance.</p></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {numbers.map((number) => <div key={number.id} className="plan-card group text-center"><div className="mb-2 text-[36px] transition-transform duration-200 group-hover:-translate-y-1">{number.flag}</div><h3 className="text-sm font-bold text-white">{number.country} {number.code}</h3><p className="my-3 font-display text-2xl font-semibold text-white"><span className="mr-1 text-xs font-medium text-[#8a7ca1]">KES</span>{number.price}</p><button onClick={() => setShowPay(number)} className="primary-button w-full">Buy now <ArrowRight size={15} /></button></div>)}
      </div>
    </div>
    {showPay && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><button aria-label="Close foreign number payment modal" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPay(null)} /><div className="relative w-full max-w-[360px] rounded-[20px] border border-[#2d1f4e] bg-[#1a102e] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"><button onClick={() => setShowPay(null)} className="icon-button absolute right-4 top-4" aria-label="Close foreign number payment modal"><X size={15} /></button><div className="mb-5 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-2xl">{showPay.flag}</div><h3 className="text-base font-bold text-white">{showPay.country} {showPay.code}</h3><p className="mt-1 text-sm text-[#a99abb]">KES {showPay.price}</p></div><div className="flex gap-3"><button onClick={() => setShowPay(null)} className="secondary-button flex-1">Cancel</button><button onClick={pay} className="primary-button flex-1">Pay KES {showPay.price}</button></div></div></div>}
  </DashboardLayout>;
}

function OnlineJobsPage() {
  const jobs = [
    { id: "data-entry", title: "Data Entry & Typing", emoji: "⌨️", pay: "$5 - $15 / hour", fee: "430", desc: "Simple typing jobs. Copy data from images/PDFs to system. No experience needed, just fast typing.", tasks: ["Typing 30WPM+", "Copy paste", "2-3 hrs daily"], time: "2-4 Hours Daily" },
    { id: "image-annotation", title: "Image Annotation", emoji: "🖼️", pay: "$8 - $20 / hour", fee: "500", popular: true, desc: "Draw boxes around cars, people, objects in images to train AI self-driving cars. Highest paying.", tasks: ["Draw boxes on images", "Label objects", "Train AI models"], time: "3-5 Hours Daily" },
    { id: "audio-transcription", title: "Audio Transcription", emoji: "🎧", pay: "$6 - $18 / hour", fee: "400", desc: "Listen to short audio clips (5-10 sec) and type what you hear. Good for good listeners.", tasks: ["Listen & type", "English audio", "Short clips"], time: "2-3 Hours Daily" },
    { id: "content-moderation", title: "Content Moderation", emoji: "🛡️", pay: "$7 - $16 / hour", fee: "450", desc: "Review posts, images, videos and decide if they follow rules. Work for big social apps.", tasks: ["Review posts", "Flag bad content", "Follow guidelines"], time: "Flexible Hours" },
    { id: "lidar", title: "3D LiDAR Annotation", emoji: "🚗", pay: "$12 - $30 / hour", fee: "850", desc: "Premium job. Annotate 3D point cloud data for self-driving AI. Training provided, high pay.", tasks: ["3D box annotation", "Advanced level", "Training included"], time: "4-6 Hours Daily" },
    { id: "ai-chat", title: "AI Chat Trainer", emoji: "🤖", pay: "$10 - $25 / hour", fee: "650", desc: "Chat with AI and rate its answers. Help make AI smarter. Easy English writing job.", tasks: ["Chat with AI", "Rate responses", "Write examples"], time: "2-4 Hours Daily" },
  ];
  const [showApply, setShowApply] = useState<(typeof jobs)[number] | null>(null);
  const usdRate = 130;

  function apply() {
    if (!showApply) return;
    const result = activatePlan({ name: showApply.title, price: showApply.fee, ram: "—", type: "Online Job" });
    if (!result.success) {
      toast.error("Insufficient wallet balance", { description: `Add KES ${(Number(showApply.fee) - result.balance).toFixed(2)} to pay this application fee.` });
      return;
    }
    setShowApply(null);
    toast.success("Application submitted", { description: `${showApply.title} has been added to My Servers.` });
  }

  return <DashboardLayout><AppHeader title="Online Jobs" subtitle="Work from home with flexible tasks and daily earning opportunities." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6"><p className="eyebrow"><span className="eyebrow-dot" /> Work from home</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-white">Online jobs</h2><p className="mt-2 text-sm text-[#877a9f]">Remote tasks with daily payouts and training included.</p></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => <div key={job.id} className={`plan-card flex flex-col ${job.popular ? "border-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.2)]" : ""}`}>{job.popular && <span className="mb-3 w-fit rounded-full bg-[#7c3aed] px-3 py-1 text-[10px] font-bold text-white">MOST DEMANDED 🔥</span>}<div className="mb-3 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2d1f4e] bg-[#0f0a1a] text-[22px]">{job.emoji}</div><div><h3 className="text-[15px] font-bold leading-tight text-white">{job.title}</h3><p className="text-xs font-semibold text-[#a855f7]">{job.pay}</p></div></div><p className="mb-4 text-[13px] leading-[1.5] text-[#b8a9d9]">{job.desc}</p><div className="mb-4 space-y-1.5 rounded-xl bg-[#0f0a1a] p-3">{job.tasks.map((task) => <div key={task} className="flex gap-2 text-xs text-[#8b7aaa]"><span className="text-[#a855f7]">•</span>{task}</div>)}<div className="pt-1 text-[11px] text-[#6b5a8a]">⏰ {job.time}</div></div><div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4"><div><p className="text-[11px] text-[#6b5a8a]">Application fee</p><p className="text-lg font-extrabold text-white">KES {job.fee}</p><p className="text-[10px] text-[#7f7195]">≈ ${(Number(job.fee) / usdRate).toFixed(2)} USD</p></div><button onClick={() => setShowApply(job)} className="primary-button px-5">Apply now</button></div></div>)}
      </div>
    </div>
    {showApply && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><button aria-label="Close job application modal" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowApply(null)} /><div className="relative w-full max-w-[390px] rounded-[20px] border border-[#2d1f4e] bg-[#1a102e] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"><button onClick={() => setShowApply(null)} className="icon-button absolute right-4 top-4" aria-label="Close job application modal"><X size={15} /></button><div className="mb-5 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-2xl">{showApply.emoji}</div><h3 className="text-base font-bold text-white">{showApply.title}</h3><p className="mt-1 text-sm text-[#a99abb]">Application fee: KES {showApply.fee}</p><p className="mt-1 text-[11px] text-[#7f7195]">≈ ${(Number(showApply.fee) / usdRate).toFixed(2)} USD</p></div><div className="flex gap-3"><button onClick={() => setShowApply(null)} className="secondary-button flex-1">Cancel</button><button onClick={apply} className="primary-button flex-1">Pay KES {showApply.fee}</button></div></div></div>}
  </DashboardLayout>;
}

function WalletPage() {
  const paystackUrl = "https://paystack.shop/pay/o2dkau16m7";
  const [showPay, setShowPay] = useState(false);
  const [balance] = useState(() => Number(localStorage.getItem("fluxy_balance") || "0"));

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = paystackUrl;
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return <DashboardLayout><AppHeader title="Wallet" subtitle="Manage your balance and transactions." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mx-auto max-w-[1000px]">
      <div className="wallet-hero mb-6"><div className="wallet-hero-glow" /><div className="relative"><p className="text-[13px] font-medium text-[#a99abb]">Current balance</p><p className="mt-2 font-display text-[40px] font-semibold tracking-[-0.055em] text-white">KES {balance.toFixed(2)}</p><p className="mt-1 text-xs text-[#74678c]">Available for renewals &amp; purchases</p><button onClick={() => setShowPay(true)} className="primary-button mt-6">+ Add funds</button><p className="mt-3 text-[11px] text-[#6b5a8a]">Secure payment by Paystack · Instant credit</p></div></div>
    </div>
    {showPay && <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><button aria-label="Close payment modal" className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPay(false)} /><div className="wallet-pay-modal relative w-full max-w-[480px] overflow-hidden rounded-[20px] border border-[#2d1f4e] bg-[#1a102e] shadow-[0_25px_80px_rgba(0,0,0,0.7)]"><div className="flex items-center justify-between border-b border-[#2d1f4e] bg-[#0f0a1a] p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-lg">💳</div><div><h3 className="text-[15px] font-bold text-white">Add funds</h3><p className="text-[11px] text-[#8b7aaa]">Paystack secure checkout</p></div></div><button onClick={() => setShowPay(false)} className="icon-button" aria-label="Close payment modal"><X size={15} /></button></div><div className="bg-white"><iframe src={paystackUrl} title="Paystack Checkout" className="h-[600px] w-full border-0" allow="payment" loading="eager" /></div><div className="flex items-center justify-between border-t border-[#2d1f4e] bg-[#0f0a1a] p-3"><span className="text-[11px] text-[#6b5a8a]">🔒 Secured by Paystack</span></div></div></div>}
  </DashboardLayout>;
}

function App() {
  return <><Switch><Route path="/" component={() => <RedirectTo href={isLoggedIn() ? "/dashboard" : "/login"} />} /><Route path="/login" component={LoginPage} /><Route path="/signup" component={SignupPage} /><Route path="/reset-password" component={ResetPasswordPage} /><Route path="/dashboard"><RequireAuth><DashboardPage /></RequireAuth></Route><Route path="/vps"><RequireAuth><VpsPage /></RequireAuth></Route><Route path="/channels"><RequireAuth><ChannelsPage /></RequireAuth></Route><Route path="/foreign-numbers"><RequireAuth><ForeignNumbersPage /></RequireAuth></Route><Route path="/online-jobs"><RequireAuth><OnlineJobsPage /></RequireAuth></Route><Route path="/servers"><RequireAuth><ServersPage /></RequireAuth></Route><Route path="/wallet"><RequireAuth><WalletPage /></RequireAuth></Route><Route><RedirectTo href="/login" /></Route></Switch><Toaster theme="dark" toastOptions={{ style: { background: "#1a102e", border: "1px solid #3a2863", color: "#fff" } }} /></>;
}

function RedirectTo({ href }: { href: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(href); }, [href, navigate]);
  return null;
}

export default App;
