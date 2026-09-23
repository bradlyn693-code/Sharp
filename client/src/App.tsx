import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { Toaster, toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  Database,
  ExternalLink,
  HardDrive,
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
    name: "Starter",
    price: "50.00",
    currency: "Kshs",
    subtitle: "A lightweight start for personal projects.",
    specs: [
      ["Memory", "400 MB"],
      ["Disk", "2000 MB"],
      ["CPU", "100%"],
      ["Databases", "1"],
      ["Backups", "1"],
    ],
    accent: "slate",
    popular: false,
  },
  {
    name: "Basic",
    price: "80.00",
    currency: "KES",
    subtitle: "A step up for small communities.",
    specs: [
      ["Memory", "1024 MB"],
      ["Disk", "5000 MB"],
      ["CPU", "150%"],
      ["Databases", "2"],
      ["Backups", "2"],
    ],
    accent: "indigo",
    popular: false,
  },
  {
    name: "Standard",
    price: "100.00",
    currency: "KES",
    subtitle: "Our most popular plan.",
    specs: [
      ["Memory", "2048 MB"],
      ["Disk", "10240 MB"],
      ["CPU", "200%"],
      ["Databases", "3"],
      ["Backups", "3"],
    ],
    accent: "violet",
    popular: true,
  },
  {
    name: "Pro",
    price: "150.00",
    currency: "KES",
    subtitle: "For larger, high-traffic servers.",
    specs: [
      ["Memory", "4096 MB"],
      ["Disk", "20480 MB"],
      ["CPU", "300%"],
      ["Databases", "5"],
      ["Backups", "5"],
    ],
    accent: "fuchsia",
    popular: false,
  },
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
] as const;

const vpsPlans = [
  { id: "vps-8", emoji: "🎱", name: "VPS 8GB RAM", ram: "8GB", price: "980", vcpu: "2 vCPU", storage: "50GB NVMe SSD", bandwidth: "2TB Transfer", ip: "1 Dedicated IP", desc: "Perfect for small businesses, WordPress sites & starter game servers.", bestFor: "Best for: Blogs, Small E-commerce, Minecraft 20 players", features: ["2 vCPU Xeon", "50GB NVMe SSD", "2TB Bandwidth", "DDoS Protection", "Instant Deploy"], popular: false },
  { id: "vps-12", emoji: "🏈", name: "VPS 12GB RAM", ram: "12GB", price: "1600", vcpu: "3 vCPU", storage: "80GB NVMe SSD", bandwidth: "3TB Transfer", ip: "1 Dedicated IP", desc: "Balanced power for growing communities and medium traffic apps.", bestFor: "Best for: GTA Roleplay, Medium Businesses, WooCommerce", features: ["3 vCPU Xeon", "80GB NVMe SSD", "3TB Bandwidth", "Daily Backups", "Root Access"], popular: false },
  { id: "vps-24", emoji: "⚾", name: "VPS 24GB RAM", ram: "24GB", price: "3500", vcpu: "6 vCPU", storage: "150GB NVMe SSD", bandwidth: "5TB Transfer", ip: "1 Dedicated IP + IPv6", desc: "High-performance workhorse — our most popular VPS for serious workloads.", bestFor: "Best for: Large MC Networks, SaaS Apps, High-Traffic Sites", features: ["6 vCPU Xeon Gold", "150GB NVMe SSD", "5TB Bandwidth", "Priority Support", "Free cPanel"], popular: true },
  { id: "vps-48", emoji: "🏓", name: "VPS 48GB RAM", ram: "48GB", price: "4900", vcpu: "8 vCPU", storage: "300GB NVMe SSD", bandwidth: "Unmetered", ip: "2 Dedicated IPs", desc: "Enterprise-grade power for resource-heavy applications & virtualization.", bestFor: "Best for: Dedicated Game Hosting, Enterprise Apps, Video Streaming", features: ["8 vCPU Xeon Gold", "300GB NVMe SSD", "Unmetered Bandwidth", "24/7 Phone Support", "Free Migration"], popular: false },
  { id: "vps-64", emoji: "⛳", name: "VPS 64GB RAM", ram: "64GB", price: "6000", vcpu: "12 vCPU", storage: "500GB NVMe SSD", bandwidth: "Unmetered", ip: "3 Dedicated IPs", desc: "Ultimate performance — no limits. Bare-metal like power in a VPS.", bestFor: "Best for: Large Enterprises, Private Cloud, Heavy Virtualization", features: ["12 vCPU Xeon Platinum", "500GB NVMe SSD", "Unmetered + 10Gbps Port", "Dedicated Support Agent", "Custom ISO"], popular: false },
] as const;

const navItems: { label: string; href: string; icon: LucideIcon; soon?: boolean }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "VPS", href: "/vps", icon: Cloud },
  { label: "My Servers", href: "/servers", icon: Server },
  { label: "Wallet", href: "/wallet", icon: WalletCards },
  { label: "Deployments", href: "#", icon: Zap, soon: true },
  { label: "Analytics", href: "#", icon: BarChart3, soon: true },
  { label: "Settings", href: "#", icon: Settings, soon: true },
];

function isLoggedIn() {
  return typeof window !== "undefined" && localStorage.getItem("fluxy_logged") === "true";
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

function LoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState(localStorage.getItem("fluxy_email") ?? "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isLoggedIn()) navigate("/dashboard");
  }, [navigate]);

  function submit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem("fluxy_logged", "true");
    localStorage.setItem("fluxy_email", email || "hello@fluxy.tech");
    navigate("/dashboard");
    toast.success("Welcome back to Fluxy Tech", { description: "Your infrastructure workspace is ready." });
  }

  return (
    <AuthShell eyebrow="The cloud, clarified" title="Welcome back" subtitle="Sign in to your dashboard and keep building at the speed of your ideas.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email address" type="email" placeholder="you@company.com" value={email} onChange={setEmail} />
        <div>
          <Field label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
          <div className="mt-3 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-[#8b7aaa]"><input type="checkbox" className="purple-checkbox" defaultChecked /> Remember me</label>
            <Link href="/reset-password" className="font-semibold text-[#b47cff] transition-colors hover:text-white">Forgot password?</Link>
          </div>
        </div>
        <button className="primary-button mt-3 w-full" type="submit">Sign in <ArrowRight size={16} /></button>
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
    localStorage.setItem("fluxy_logged", "true");
    localStorage.setItem("fluxy_email", email || "hello@fluxy.tech");
    localStorage.setItem("fluxy_name", name || "Alex Morgan");
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
  const name = localStorage.getItem("fluxy_name") || "Alex Morgan";
  const email = localStorage.getItem("fluxy_email") || "alex@northstar.io";
  function signOut() {
    localStorage.clear();
    navigate("/login");
  }
  return (
    <>
      {mobileOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-[#050309]/70 backdrop-blur-sm lg:hidden" onClick={closeMobile} />}
      <aside className={`sidebar fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[#2d1f4e] bg-[#0a0612] px-4 py-5 transition-[width,transform,padding] duration-200 lg:translate-x-0 ${collapsed ? "sidebar-collapsed lg:w-[82px] lg:px-3" : ""} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className={`mb-8 flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-3"}`}><Brand compact={collapsed} /><div className="flex items-center gap-2"><button onClick={toggleCollapsed} className="icon-button hidden lg:grid" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button><button onClick={closeMobile} className="icon-button lg:hidden"><X size={17} /></button></div></div>
        <div className="sidebar-section mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e5273]">Workspace</div>
        <nav className="space-y-1">
          {navItems.slice(0, 4).map((item) => {
            const active = location === item.href || (item.href === "/dashboard" && location === "/");
            return <Link key={item.label} href={item.href} onClick={closeMobile} className={`nav-item ${active ? "nav-item-active" : ""}`}><item.icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span className="sidebar-label">{item.label}</span>{active && <span className="nav-active-line" />}</Link>;
          })}
        </nav>
        <div className="sidebar-section mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5e5273]">Manage</div>
        <nav className="space-y-1">
          {navItems.slice(4).map((item) => <button key={item.label} onClick={() => toast.info(`${item.label} is coming soon`, { description: "We’re polishing this part of your workspace." })} className="nav-item w-full text-left"><item.icon size={17} strokeWidth={1.8} /><span className="sidebar-label">{item.label}</span><span className="sidebar-label ml-auto text-[9px] font-semibold uppercase tracking-wider text-[#5d5174]">Soon</span></button>)}
        </nav>
        <div className="mt-auto sidebar-user-area">
          <div className="mb-4 rounded-2xl border border-[#2d1f4e] bg-[#130b22] p-3">
            <div className="flex items-center gap-3"><div className="avatar">{name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div className="sidebar-user-meta min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{name}</p><p className="truncate text-[11px] text-[#7e719a]">{email}</p></div><ChevronDown size={14} className="text-[#786b91]" /></div>
            <div className="sidebar-user-plan mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3"><span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#b78cff]"><Sparkles size={12} /> PRO PLAN</span><span className="text-[10px] text-[#6c5f84]">Renews 24 Oct</span></div>
          </div>
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
  function buy() {
    localStorage.setItem("fluxy_selected_plan", plan.name);
    toast.success(`${plan.name} plan selected`, { description: "Your plan is ready to activate from the wallet." });
    navigate("/wallet");
  }
  return <article className={`plan-card ${plan.popular ? "plan-card-popular" : ""}`}>
    {plan.popular && <div className="popular-badge"><Sparkles size={12} /> MOST POPULAR</div>}
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`plan-orb plan-orb-${plan.accent}`} /><h3 className="text-[18px] font-semibold text-white">{plan.name}</h3></div><p className="mt-2 min-h-[36px] text-xs leading-5 text-[#8f82a4]">{plan.subtitle}</p></div><button className="plan-more" aria-label={`${plan.name} details`}><MoreHorizontal size={16} /></button></div>
    <div className="mt-5 flex items-end gap-1"><span className="text-xs font-semibold text-[#8b7aaa]">{plan.currency}</span><span className="font-display text-[28px] font-semibold tracking-[-0.045em] text-white">{plan.price}</span><span className="mb-1 text-[11px] text-[#776a8f]">/ monthly</span></div>
    <div className="my-5 h-px bg-[#2d1f4e]" />
    <div className="space-y-3">{plan.specs.map(([label, value]) => <div key={label} className="flex items-center justify-between text-xs"><span className="text-[#887b9d]">{label}</span><span className="font-medium text-[#eee8fb]">{value}</span></div>)}</div>
    <button onClick={buy} className={`buy-button mt-6 w-full ${plan.popular ? "buy-button-featured" : ""}`}>Buy now <ArrowRight size={14} /></button>
  </article>;
}

function DashboardPage() {
  const [query, setQuery] = useState("");
  const filteredPlans = useMemo(() => plans.filter((plan) => `${plan.name} ${plan.subtitle}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <DashboardLayout><AppHeader title="Pricing & Plans" subtitle="Choose the perfect plan for your infrastructure · Upgrade anytime, cancel anytime" onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} /><div className="mb-7 grid gap-4 md:grid-cols-3"><StatCard icon={Server} label="Active servers" value="12 / 20" meta="+2 added this month" /><StatCard icon={WalletCards} label="Wallet balance" value="$1,240.50" meta="Available for renewals" /><StatCard icon={Activity} label="Monthly usage" value="78%" meta="of Pro plan limit" progress={78} /></div><section><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Pick your capacity</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white">Plans that scale with you</h2></div><label className="dashboard-filter"><Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter plans" /></label></div><div className="plan-grid">{filteredPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}</div>{filteredPlans.length === 0 && <div className="empty-search"><Search size={22} /><p>No plans match “{query}”.</p></div>}</section></DashboardLayout>;
}


function VpsPage() {
  const [showPay, setShowPay] = useState<(typeof vpsPlans)[number] | null>(null);
  const [purchased, setPurchased] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  function confirmPayment() {
    if (!showPay) return;
    const servers = JSON.parse(localStorage.getItem("fluxy_servers") || "[]");
    servers.push({ id: Date.now(), plan: showPay.name, ram: showPay.ram, price: showPay.price, date: new Date().toLocaleDateString(), type: "VPS" });
    localStorage.setItem("fluxy_servers", JSON.stringify(servers));
    setPurchased(showPay.name);
    setShowPay(null);
    toast.success(`${showPay.name} purchased`, { description: "Your VPS has been added to My Servers." });
    window.setTimeout(() => setPurchased(null), 2500);
  }

  return <DashboardLayout><AppHeader title="VPS" subtitle="NVMe SSD · DDoS protected · Instant setup · Kenya location" onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow"><span className="eyebrow-dot" /> Virtual private servers</p><h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-white">Power without the complexity</h2></div><span className="hidden items-center gap-2 text-xs text-[#8b7aaa] sm:flex"><span className="status-dot" /> All systems operational</span></div>
    <div className="vps-grid">{vpsPlans.map((plan) => <article key={plan.id} className={`vps-card ${plan.popular ? "vps-card-popular" : ""}`}>{plan.popular && <div className="vps-popular"><Sparkles size={12} /> POPULAR</div>}<div className="flex items-start gap-3"><div className="vps-emoji">{plan.emoji}</div><div><h3 className="text-[18px] font-bold text-white">{plan.name}</h3><p className="mt-1 text-xs text-[#a855f7]">{plan.vcpu} · {plan.storage}</p></div></div><div className="mt-5 flex items-baseline gap-2"><span className="font-display text-[27px] font-semibold tracking-[-0.04em] text-white">KSH {plan.price}</span><span className="text-xs text-[#6b5a8a]">/ monthly</span></div><p className="mt-2 min-h-[40px] text-[13px] leading-5 text-[#b8a9d9]">{plan.desc}</p><div className="mt-4 rounded-[10px] border border-[#2d1f4e]/70 bg-[#0f0a1a] px-3 py-2"><p className="text-[11px] font-semibold text-[#c084fc]">{plan.bestFor}</p></div><div className="my-4 h-px bg-[#2d1f4e]" /><div className="mb-5 flex-1 space-y-3"><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">RAM</span><span className="text-[13px] font-bold text-white">{plan.ram} DDR4</span></div><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">Disk</span><span className="text-[13px] text-white">{plan.storage}</span></div><div className="flex justify-between"><span className="text-[13px] text-[#8b7aaa]">Bandwidth</span><span className="text-[13px] text-white">{plan.bandwidth}</span></div></div><button onClick={() => setShowPay(plan)} className={`buy-button w-full ${plan.popular ? "buy-button-featured" : ""}`}>{purchased === plan.name ? "✓ Purchased!" : `BUY NOW · KSH ${plan.price}`}</button></article>)}</div>
    {showPay && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-[420px] rounded-[20px] border border-[#2d1f4e] bg-[#1a102e] p-7 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Confirm purchase</p><h3 className="mt-3 text-[18px] font-bold text-white">{showPay.name}</h3></div><button className="icon-button" onClick={() => setShowPay(null)} aria-label="Close payment dialog"><X size={16} /></button></div><div className="mb-5 rounded-[12px] border border-[#2d1f4e] bg-[#0f0a1a] p-4"><div className="flex justify-between text-sm"><span className="text-[#8b7aaa]">Total</span><span className="font-bold text-white">KSH {showPay.price}/mo</span></div><div className="mt-3 flex justify-between text-xs"><span className="text-[#77698e]">Provisioning</span><span className="font-medium text-[#a855f7]">Instant</span></div></div><div className="flex gap-3"><button onClick={() => setShowPay(null)} className="flex-1 rounded-[12px] border border-[#2d1f4e] bg-[#0f0a1a] py-3 text-sm font-semibold text-[#b8a9d9]">Cancel</button><button onClick={confirmPayment} className="primary-button flex-1">Pay KSH {showPay.price}</button></div></div></div>}
  </DashboardLayout>;
}

function ServersPage() {
  const servers = JSON.parse(localStorage.getItem("fluxy_servers") || "[]") as { id: number; plan: string; ram: string; price: string; date: string; type: string }[];
  return <DashboardLayout><AppHeader title="My Servers" subtitle="Keep an eye on every environment from one calm workspace." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} />{servers.length === 0 ? <div className="empty-panel"><div className="server-illustration"><div className="server-rack"><span /><span /><span /></div><div className="server-pulse" /></div><h2 className="mt-7 font-display text-2xl font-semibold tracking-[-0.035em] text-white">No servers yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#877a9f]">Your infrastructure will show up here once you activate your first plan. Ready when you are.</p><Link href="/vps" className="primary-button mt-7">Explore VPS plans <ArrowRight size={15} /></Link></div> : <div><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Provisioned infrastructure</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Your active servers</h2></div><Link href="/vps" className="primary-button">Add server <Plus size={15} /></Link></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{servers.map((server) => <div key={server.id} className="server-card"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="server-status-icon"><Server size={17} /></div><div><h3 className="text-sm font-semibold text-white">{server.plan}</h3><p className="mt-1 text-[11px] text-[#807294]">{server.type} · {server.date}</p></div></div><span className="status-pill">Active</span></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-4"><div><p className="text-[10px] uppercase tracking-wider text-[#766a8c]">Memory</p><p className="mt-1 text-sm font-semibold text-white">{server.ram} DDR4</p></div><div><p className="text-[10px] uppercase tracking-wider text-[#766a8c]">Monthly</p><p className="mt-1 text-sm font-semibold text-white">KSH {server.price}</p></div></div></div>)}</div></div>}</DashboardLayout>;
}

function WalletPage() {
  const selected = localStorage.getItem("fluxy_selected_plan");
  function addFunds() { toast.info("Payments are in preview mode", { description: "Connect a payment method to fund your Fluxy wallet." }); }
  return <DashboardLayout><AppHeader title="Wallet" subtitle="Keep renewals simple and your infrastructure moving." onMenu={() => window.dispatchEvent(new Event("fluxy:open-menu"))} /><div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]"><div className="balance-card"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9484ae]">Available balance</p><p className="mt-4 font-display text-5xl font-semibold tracking-[-0.055em] text-white">KES 0.00</p></div><div className="wallet-icon"><WalletCards size={21} /></div></div><div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/[0.09] pt-5 sm:flex-row sm:items-center"><p className="text-xs text-[#8b7ba4]">Add funds to cover plan renewals and usage.</p><button className="primary-button shrink-0" onClick={addFunds}><Plus size={15} /> Add funds</button></div></div><div className="wallet-note"><div className="mb-4 flex items-center gap-2 text-xs font-semibold text-white"><ShieldCheck size={16} className="text-[#b47cff]" /> Secure by default</div><p className="text-sm leading-6 text-[#8b7ba4]">Your wallet balance is only used for your Fluxy infrastructure. No surprise charges, ever.</p><div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#b47cff]"><LockKeyhole size={14} /> Encrypted billing controls</div></div></div><section className="mt-8"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow"><span className="eyebrow-dot" /> Ledger</p><h2 className="mt-2 font-display text-xl font-semibold text-white">Transaction history</h2></div><button onClick={() => toast.info("Your transaction history is already up to date.")} className="text-xs font-semibold text-[#ae7cff] hover:text-white">View all</button></div><div className="transaction-card overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead><tr><th>Date</th><th>Description</th><th>Status</th><th className="text-right">Amount</th></tr></thead><tbody><tr><td className="text-[#a99abb]">23 Sep 2026</td><td><div className="flex items-center gap-3"><div className="table-icon"><Sparkles size={14} /></div><div><p className="font-medium text-white">{selected ? `${selected} plan selection` : "Fluxy wallet opened"}</p><p className="mt-1 text-[11px] text-[#796c90]">Workspace activity</p></div></div></td><td><span className="status-pill">Completed</span></td><td className="text-right font-semibold text-white">KES 0.00</td></tr></tbody></table></div></section></DashboardLayout>;
}

function App() {
  return <><Switch><Route path="/" component={() => <RedirectTo href={isLoggedIn() ? "/dashboard" : "/login"} />} /><Route path="/login" component={LoginPage} /><Route path="/signup" component={SignupPage} /><Route path="/reset-password" component={ResetPasswordPage} /><Route path="/dashboard"><RequireAuth><DashboardPage /></RequireAuth></Route><Route path="/vps"><RequireAuth><VpsPage /></RequireAuth></Route><Route path="/servers"><RequireAuth><ServersPage /></RequireAuth></Route><Route path="/wallet"><RequireAuth><WalletPage /></RequireAuth></Route><Route><RedirectTo href="/login" /></Route></Switch><Toaster theme="dark" toastOptions={{ style: { background: "#1a102e", border: "1px solid #3a2863", color: "#fff" } }} /></>;
}

function RedirectTo({ href }: { href: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(href); }, [href, navigate]);
  return null;
}

export default App;
