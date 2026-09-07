import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Bell,
  Search,
  Building,
  Building2,
  BedDouble,
  MapPin,
  Clock3,
  Activity,
  Cable,
  Server,
  Globe,
  RefreshCw,
  PhoneCall,
  Workflow,
  AlertTriangle,
  ListChecks,
  TrendingUp,
  Users,
  Scale,
  BadgeCheck,
  Gauge,
  Link as LinkIcon,
  LogIn,
  LogOut,
  Hash,
  CalendarDays,
  Landmark,
  Receipt,
  UserRound,
  Images,
  Layers,
} from "lucide-react";
import {
  CardShell,
  Donut,
  LegendItem,
  ActionTile,
  Panel,
  InitialsAvatar,
} from "@/components/hotel/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  scenarios,
  scenarioLabels,
  type Scenario,
  type Health,
  type Hotel,
} from "@/lib/hotel-data";
import { StatusDot, StatusPill, CopyButton } from "@/components/hotel/primitives";
import {
  EditDialog,
  type EditTarget,
  type EditField,
  type GalleryImage,
} from "@/components/hotel/EditDialog";
import { AppSidebar } from "@/components/hotel/AppSidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import propertyImage from "@/assets/hotel-property.jpg";
import lobbyImage from "@/assets/hotel-lobby.jpg";
import roomImage from "@/assets/hotel-room.jpg";
import poolImage from "@/assets/hotel-pool.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maritime Hotel #921 · Hotel Workspace" },
      {
        name: "description",
        content:
          "Internal hotel workspace: property identity, operational health, PMS and booking engine connections, people, legal and billing, service status and references.",
      },
      { property: "og:title", content: "Maritime Hotel #921 · Hotel Workspace" },
      {
        property: "og:description",
        content:
          "One coherent workspace for a single hotel: identity, health, connections, people, legal & billing, service and links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HotelWorkspace,
});

/* ---------------------------------------------------------------- */
/* small building blocks                                             */
/* ---------------------------------------------------------------- */

const healthWord: Record<Health, string> = {
  healthy: "Healthy",
  warning: "Attention",
  failed: "Error",
  neutral: "Not configured",
};

function SubTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-semibold tracking-[0.11em] text-muted-foreground uppercase">
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-[7px]">
      <span className="shrink-0 pt-px text-[12.5px] text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 text-right text-[13.5px] font-medium text-foreground">
        {value}
        {action}
      </span>
    </div>
  );
}

function Surface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-[0_1px_3px_oklch(0.25_0.03_255/0.03),0_8px_24px_-14px_oklch(0.25_0.03_255/0.15)] transition-all duration-200 hover:border-primary/15 hover:shadow-[0_2px_6px_oklch(0.25_0.03_255/0.04),0_16px_36px_-18px_oklch(0.25_0.03_255/0.2)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ConnRow({
  icon: Icon,
  label,
  sub,
  status,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  status: Health;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60">
      <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-foreground">{label}</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">{sub}</span>
      </span>
      {value ? (
        <StatusPill status={status} label={value} className="shrink-0" />
      ) : (
        <StatusDot status={status} label="" />
      )}
    </div>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="text-[13px] text-muted-foreground">{children}</span>;
}

/* ---------------------------------------------------------------- */
/* page                                                              */
/* ---------------------------------------------------------------- */

const sectionNav = [
  { id: "snapshot", label: "Health" },
  { id: "identity", label: "Identity" },
  { id: "people", label: "People" },
  { id: "legal", label: "Legal & billing" },
  { id: "service", label: "Service" },
  { id: "links", label: "Links" },
];

const tagLibrary = ["Priority", "Enterprise", "Marriott", "VIP", "Cruiseport", "Churn risk"];

function HotelWorkspace() {
  const [scenario, setScenario] = useState<Scenario>("live");
  const [store, setStore] = useState<Record<Scenario, Hotel>>(scenarios);
  const [edit, setEdit] = useState<EditTarget>(null);
  const [detail, setDetail] = useState<null | "features" | "jobs" | "onboarding">(null);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);
  const [tagQuery, setTagQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("snapshot");

  const hotel = store[scenario];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 220);
      let current = sectionNav[0]?.id ?? "snapshot";
      for (const s of sectionNav) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 190) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const patch = (fn: (h: Hotel) => Hotel) =>
    setStore((s) => ({ ...s, [scenario]: fn(s[scenario]) }));

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openEdit = (
    title: string,
    fields: EditField[],
    onSave?: (values: Record<string, string>) => void,
  ) => setEdit(onSave ? { title, fields, onSave } : { title, fields });

  /* ---------------- derived ---------------- */

  const attention = hotel.health.total - hotel.health.healthy;

  const lifecycle = useMemo(() => {
    if (hotel.service.status === "Churned")
      return {
        status: "neutral" as Health,
        label: "Service ended",
        sub: `Churned ${hotel.service.churnDate ?? "—"}`,
      };
    if (hotel.onboarding)
      return {
        status: "warning" as Health,
        label: "Onboarding",
        sub: hotel.onboarding.stage,
      };
    if (hotel.service.status === "Not started")
      return { status: "warning" as Health, label: "Onboarding", sub: "Not started" };
    if (attention > 0)
      return {
        status: (attention > hotel.health.total / 2 ? "failed" : "warning") as Health,
        label: "Attention required",
        sub: `${attention} item${attention > 1 ? "s" : ""} need attention`,
      };
    return {
      status: "healthy" as Health,
      label: "Active",
      sub: `Service started ${hotel.service.startedOn}`,
    };
  }, [hotel, attention]);

  const location = useMemo(() => {
    const addr = hotel.legal?.billingAddress;
    if (!addr) return null;
    const parts = addr.split(",").map((p) => p.trim());
    const city = parts[1];
    const state = parts[2]?.split(" ")[0];
    return city && state ? `${city}, ${state}` : null;
  }, [hotel.legal]);

  const counts = useMemo(() => {
    const c = { healthy: 0, warning: 0, failed: 0, neutral: 0 };
    for (const g of hotel.health.groups)
      for (const f of g.features) c[f.status] += 1;
    return c;
  }, [hotel.health.groups]);

  const healthPct = hotel.health.total
    ? Math.round((hotel.health.healthy / hotel.health.total) * 100)
    : 0;

  const onboardingSteps: { label: string; state: "complete" | "action" | "pending"; action?: string }[] =
    hotel.onboarding?.mandatory ?? [
      { label: "Campaign registry", state: "complete" },
      { label: "PMS sync", state: "action", action: "Set up" },
      { label: "Booking engine", state: "complete" },
      { label: "Proxy number", state: "complete" },
      { label: "Brand logo and colors", state: "complete" },
    ];

  const onboardingPct = onboardingSteps.length
    ? Math.round(
        (onboardingSteps.filter((s) => s.state === "complete").length / onboardingSteps.length) *
          100,
      )
    : 0;

  /* ---------------- actions ---------------- */

  const runStatusCheck = () => {
    if (checking) return;
    setChecking(true);
    setCheckResult(null);
    window.setTimeout(() => {
      setChecking(false);
      setCheckResult(
        attention === 0
          ? "Hotel status is healthy"
          : `Attention required · ${attention} issue${attention > 1 ? "s" : ""} found`,
      );
    }, 1100);
  };

  const getOtp = () => setOtp(String(Math.floor(100000 + Math.random() * 900000)));

  const addTag = (tag: string) => {
    if (hotel.service.tags.includes(tag)) return;
    patch((h) => ({ ...h, service: { ...h.service, tags: [...h.service.tags, tag] } }));
    toast.success("Tag added", { description: tag });
  };

  const removeTag = (tag: string) =>
    patch((h) => ({
      ...h,
      service: { ...h.service, tags: h.service.tags.filter((t) => t !== tag) },
    }));

  const editHotel = () =>
    openEdit(
      "hotel",
      [
        { label: "Hotel name", value: hotel.name },
        { label: "Group", value: hotel.identity.group },
        { label: "Rooms", value: hotel.identity.rooms },
        { label: "Check-in", value: hotel.identity.checkIn },
        { label: "Check-out", value: hotel.identity.checkOut },
        { label: "Hotel ID", value: hotel.identity.hotelId, hint: "PMS property code" },
      ],
      (v) =>
        patch((h) => ({
          ...h,
          name: v["Hotel name"] ?? h.name,
          identity: {
            ...h.identity,
            group: v["Group"] ?? h.identity.group,
            rooms: v["Rooms"] ?? h.identity.rooms,
            checkIn: v["Check-in"] ?? h.identity.checkIn,
            checkOut: v["Check-out"] ?? h.identity.checkOut,
            hotelId: v["Hotel ID"] ?? h.identity.hotelId,
          },
        })),
    );

  const editTeam = () =>
    openEdit(
      "account team",
      [
        { label: "CSM", value: hotel.people.csm },
        { label: "Sales agent", value: hotel.people.salesAgent },
        { label: "Referrer", value: hotel.people.referrer },
      ],
      (v) =>
        patch((h) => ({
          ...h,
          people: {
            ...h.people,
            csm: v["CSM"] ?? h.people.csm,
            salesAgent: v["Sales agent"] ?? h.people.salesAgent,
            referrer: v["Referrer"] ?? h.people.referrer,
          },
        })),
    );

  const editLegal = () => {
    if (!hotel.legal) {
      openEdit("legal information", [
        { label: "Legal name", value: "" },
        { label: "Doing business as", value: "" },
        { label: "Support email", value: "" },
      ]);
      return;
    }
    const l = hotel.legal;
    openEdit(
      "legal information",
      [
        { label: "Legal name", value: l.legalName },
        { label: "Doing business as", value: l.dba },
        { label: "Support email", value: l.supportEmail },
        { label: "EIN", value: l.ein },
        { label: "TCR brand ID", value: l.tcrBrandId },
        { label: "TCR campaign ID", value: l.tcrCampaignId },
      ],
      (v) =>
        patch((h) =>
          h.legal
            ? {
                ...h,
                legal: {
                  ...h.legal,
                  legalName: v["Legal name"] ?? h.legal.legalName,
                  dba: v["Doing business as"] ?? h.legal.dba,
                  supportEmail: v["Support email"] ?? h.legal.supportEmail,
                  ein: v["EIN"] ?? h.legal.ein,
                  tcrBrandId: v["TCR brand ID"] ?? h.legal.tcrBrandId,
                  tcrCampaignId: v["TCR campaign ID"] ?? h.legal.tcrCampaignId,
                },
              }
            : h,
        ),
    );
  };

  const editBilling = () => {
    if (!hotel.legal) return;
    const l = hotel.legal;
    openEdit(
      "billing information",
      [
        { label: "Billing address", value: l.billingAddress },
        { label: "Invoice address", value: l.invoiceAddress },
      ],
      (v) =>
        patch((h) =>
          h.legal
            ? {
                ...h,
                legal: {
                  ...h.legal,
                  billingAddress: v["Billing address"] ?? h.legal.billingAddress,
                  invoiceAddress: v["Invoice address"] ?? h.legal.invoiceAddress,
                },
              }
            : h,
        ),
    );
  };

  const editService = () =>
    openEdit(
      "service & account",
      [
        { label: "Service started", value: hotel.service.startedOn },
        { label: "Churn date", value: hotel.service.churnDate ?? "" },
        { label: "Configuration stage", value: hotel.service.configurationStage },
      ],
      (v) =>
        patch((h) => ({
          ...h,
          service: {
            ...h.service,
            startedOn: v["Service started"] ?? h.service.startedOn,
            churnDate: v["Churn date"] ? v["Churn date"] : null,
            configurationStage: v["Configuration stage"] ?? h.service.configurationStage,
          },
        })),
    );

  /* ---------------- render ---------------- */

  const headerActions = (compact?: boolean) => (
    <div className="flex shrink-0 items-center gap-2">
      <Button size={compact ? "sm" : "default"} onClick={editHotel}>
        <Pencil className="size-4" /> Edit hotel
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More hotel actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Hotel utilities</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setDetail("features")}>
            View all features
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDetail("jobs")}>View PMS jobs</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => goTo("links")}>Links & references</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => goTo("service")}>
            Management company change
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <AppSidebar />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[58px] items-center border-b border-border bg-surface/95 px-4 backdrop-blur md:px-5">
          <div className="hidden h-9 w-[460px] items-center gap-2 rounded-lg bg-muted px-3 text-muted-foreground md:flex">
            <Search className="size-4" />
            <span className="text-[12px]">Search hotels, IDs, or anything…</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
             <Button className="md:hidden" variant="ghost" size="icon" aria-label="Search" title="Search">
              <Search className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" title="Notifications">
              <Bell className="size-4" />
            </Button>
            <div className="ml-2 hidden items-center gap-2 border-l border-border pl-4 sm:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-primary-foreground">LT</span>
              <span className="text-[11px] font-semibold text-foreground">Lakshay Tyagi</span>
              <span className="text-[10px] text-muted-foreground">{hotel.localTime}<br />{hotel.timezone}</span>
            </div>
          </div>
        </header>

        {/* sticky hotel context bar */}
        <div
          className={cn(
            "sticky top-16 z-30 border-b border-border bg-surface/95 backdrop-blur transition-all duration-200",
            scrolled ? "h-14 opacity-100" : "pointer-events-none h-0 overflow-hidden opacity-0",
          )}
        >
          <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-8">
            <img
              src={propertyImage}
              alt=""
              width={1024}
              height={768}
              className="size-9 rounded-md object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                {hotel.name} <span className="text-muted-foreground">{hotel.displayId}</span>
              </div>
            </div>
            <StatusDot
              status={attention === 0 ? "healthy" : "warning"}
              label={`${hotel.health.healthy}/${hotel.health.total} healthy`}
            />
            <div className="ml-auto">{headerActions(true)}</div>
          </div>
        </div>

        <main className="mx-auto max-w-[1540px] px-4 pt-4 pb-12 md:px-5">
          {/* state switcher (internal preview of page states) */}
          <div className="mb-4 hidden flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold tracking-[0.11em] text-muted-foreground uppercase">
              Page state
            </span>
            {scenarioLabels.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  scenario === s.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ---------------- bento grid ---------------- */}
          <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* hotel hero — spans full width */}
            <div className="md:col-span-2 xl:col-span-4">
              <header className="grid min-h-[220px] overflow-hidden rounded-2xl border border-border bg-foreground shadow-[0_8px_28px_oklch(0.25_0.03_255/0.1)] lg:grid-cols-[34%_66%]">
                <div className="relative min-h-[200px]">
                  <img
                    src={propertyImage}
                    alt={`Exterior of ${hotel.name}`}
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
                  <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-primary-foreground">
                    <span className="rounded-md bg-foreground/65 px-2 py-1 text-[11px] backdrop-blur-sm">1 / 5</span>
                    <Button size="sm" variant="secondary" className="h-8 bg-foreground/70 text-primary-foreground hover:bg-foreground/85">View gallery</Button>
                  </div>
                </div>
                <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden p-5 text-primary-foreground md:p-6">
                  <img src={propertyImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
                  <div className="absolute inset-0 bg-foreground/85" />
                  <div className="relative pt-10 lg:pt-0">
                    <div className="min-w-0 max-w-[760px]">
                      <div className="mb-2 flex items-center gap-2 pr-36 sm:pr-44">
                        <StatusPill status={lifecycle.status} label={lifecycle.label.toUpperCase()} />
                        <span className="text-[12px] opacity-75">Property {hotel.displayId}</span>
                      </div>
                      <h1 className="max-w-3xl text-[24px] leading-[1.15] font-bold text-primary-foreground lg:text-[26px]">
                        {hotel.name}
                      </h1>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-primary-foreground/85">
                        <span className="flex items-center gap-1.5"><Building className="size-3.5" />{hotel.identity.parentChain}</span>
                        <span className="flex items-center gap-1.5"><Building2 className="size-3.5" />{hotel.identity.group}</span>
                        <span className="flex items-center gap-1.5"><BedDouble className="size-3.5" />{hotel.identity.rooms} rooms</span>
                        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{location}</span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 text-foreground">{headerActions()}</div>
                  </div>
                  <div className="relative flex flex-wrap items-end gap-5">
                    <div className="grid grid-cols-3 gap-6">
                      {[["Hotel ID", hotel.identity.hotelId], ["Timezone", hotel.timezone], ["Local time", hotel.localTime]].map(([label, value]) => (
                        <span key={label} className="min-w-[90px]">
                          <span className="block text-[10px] text-primary-foreground/60">{label}</span>
                          <span className="mt-1 block text-[12px] font-semibold text-primary-foreground">{value}</span>
                        </span>
                      ))}
                    </div>
                    <span className="ml-auto rounded-md bg-surface px-3 py-2 text-[11px] font-medium text-foreground shadow-sm"><span className="mr-1.5 inline-block size-2 rounded-full bg-success" />{lifecycle.sub}</span>
                  </div>
                </div>
              </header>
            </div>

            {/* quick actions — compact bento tiles */}
            <div className="md:col-span-2 xl:col-span-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ActionTile
                  icon={Pencil}
                  title="Edit hotel"
                  description="Update property information"
                  onClick={editHotel}
                />
                <Popover onOpenChange={(o) => !o && setOtp(null)}>
                  <PopoverTrigger asChild>
                    <div>
                      <ActionTile
                        icon={KeyRound}
                        title="Get last OTP"
                        description="Retrieve latest access code"
                        onClick={getOtp}
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-60">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">
                      Last OTP
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-3">
                      <span className="font-mono text-[22px] font-semibold text-foreground">
                        {otp ?? "······"}
                      </span>
                      {otp ? <CopyButton value={otp} /> : null}
                    </div>
                    <p className="mt-2 text-[12px] text-muted-foreground">Expires in 5 minutes.</p>
                  </PopoverContent>
                </Popover>
                <Popover onOpenChange={(o) => o && runStatusCheck()}>
                  <PopoverTrigger asChild>
                    <div>
                      <ActionTile
                        icon={Stethoscope}
                        title="Check hotel status"
                        description="Run a current health check"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72">
                    {checking ? (
                      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" /> Checking hotel status…
                      </div>
                    ) : (
                      <StatusDot
                        status={attention === 0 ? "healthy" : "warning"}
                        label={checkResult ?? "Ready to check"}
                      />
                    )}
                  </PopoverContent>
                </Popover>
                <ActionTile
                  icon={Mail}
                  title="Hotel emails"
                  description="Open property contacts"
                  onClick={() => goTo("people")}
                />
              </div>
            </div>

            {/* in-page nav — spans full width */}
            <div className="md:col-span-2 xl:col-span-4">
              <nav
                className={cn(
                  "sticky z-20 rounded-full border border-border bg-surface/95 px-1.5 py-1 shadow-sm backdrop-blur",
                  scrolled ? "top-[112px]" : "top-[58px]",
                )}
              >
                <div className="flex flex-wrap items-center gap-1">
                  {sectionNav.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(s.id)}
                      className={cn(
                        "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                        active === s.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </nav>
            </div>

            {/* operational snapshot — bento row */}
            {/* health — large */}
            <div id="snapshot" className="scroll-mt-[118px] md:col-span-2 xl:col-span-2">
              <CardShell
                icon={Activity}
                tone="primary"
                title="Hotel health"
                subtitle="Feature coverage across the account"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-[12px]"
                    onClick={() => setDetail("features")}
                  >
                    All features <ChevronRight className="size-3.5" />
                  </Button>
                }
              >
                <div className="flex h-full flex-wrap items-center justify-center gap-6">
                  <Donut
                    total={hotel.health.total}
                    segments={[
                      { value: counts.healthy, color: "var(--success)" },
                      { value: counts.warning, color: "var(--warning)" },
                      { value: counts.failed, color: "var(--danger)" },
                    ]}
                    centerValue={`${healthPct}%`}
                    centerLabel="Healthy"
                  />
                  <div className="min-w-[168px] flex-1 space-y-0.5">
                    <LegendItem
                      color="var(--success)"
                      label="Healthy"
                      value={counts.healthy}
                    />
                    <LegendItem
                      color="var(--warning)"
                      label="Needs attention"
                      value={counts.warning}
                    />
                    <LegendItem color="var(--danger)" label="Failing" value={counts.failed} />
                    <LegendItem
                      color="var(--neutral-soft)"
                      label="Not configured"
                      value={counts.neutral}
                    />
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5">
                      <TrendingUp className="size-4 shrink-0 text-primary" />
                      <span className="text-[12px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {hotel.health.healthy}/{hotel.health.total}
                        </span>{" "}
                        features are running normally
                      </span>
                    </div>
                  </div>
                </div>
              </CardShell>
            </div>

            {/* connections — medium */}
            <div className="md:col-span-1 xl:col-span-1">
              <CardShell
                icon={Cable}
                tone={hotel.sync.pmsStatus.status === "healthy" ? "success" : "warning"}
                title="Connections"
                subtitle="Integrations and sync state"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-[12px]"
                    disabled={!hotel.sync.jobs.length}
                    onClick={() => setDetail("jobs")}
                  >
                    Jobs <ChevronRight className="size-3.5" />
                  </Button>
                }
              >
                <div className="space-y-1.5">
                  <ConnRow
                    icon={Server}
                    label="PMS"
                    sub={hotel.sync.pms}
                    status={hotel.sync.pmsStatus.status}
                    value={hotel.sync.pmsStatus.label}
                  />
                  <ConnRow
                    icon={Globe}
                    label="Booking engine"
                    sub={hotel.sync.bookingEngine}
                    status={hotel.sync.beSync.status}
                    value={hotel.sync.beSync.label}
                  />
                  <ConnRow
                    icon={RefreshCw}
                    label="Last BE sync"
                    sub={hotel.sync.lastBeSync}
                    status="neutral"
                    value=""
                  />
                  <ConnRow
                    icon={PhoneCall}
                    label="Proxy"
                    sub={hotel.sync.proxy.label}
                    status={hotel.sync.proxy.status}
                    value=""
                  />
                  <ConnRow
                    icon={Workflow}
                    label="PMS jobs"
                    sub={
                      hotel.sync.jobs.length
                        ? `${hotel.sync.jobs.length} configured`
                        : "None configured"
                    }
                    status={hotel.sync.jobs.length ? "healthy" : "neutral"}
                    value=""
                  />
                </div>
                {hotel.sync.beSync.status !== "healthy" ? (
                  <div className="mt-3 rounded-xl border border-warning/25 bg-warning-soft/60 p-3">
                    <div className="flex items-center gap-2 text-[12.5px] font-semibold text-foreground">
                      <AlertTriangle className="size-4 text-warning" />
                      Booking engine is {hotel.sync.beSync.label.toLowerCase()}
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Conversions and OTA outreach stay paused until it recovers.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2.5 h-8 rounded-full bg-surface text-[12px]"
                      onClick={runStatusCheck}
                    >
                      {checking ? <Loader2 className="size-4 animate-spin" /> : null}
                      Check status
                    </Button>
                  </div>
                ) : null}
              </CardShell>
            </div>

            {/* onboarding — medium */}
            <div className="md:col-span-1 xl:col-span-1">
              <CardShell
                icon={ListChecks}
                tone="warning"
                title="Onboarding"
                subtitle={hotel.onboarding?.stage ?? "Initial payment stage"}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-[12px]"
                    onClick={() => setDetail("onboarding")}
                  >
                    All steps <ChevronRight className="size-3.5" />
                  </Button>
                }
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-700"
                      style={{ width: `${onboardingPct}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">
                    {onboardingPct}%
                  </span>
                </div>
                <div className="space-y-1.5">
                  {onboardingSteps.slice(0, 5).map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/60"
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full",
                          m.state === "complete"
                            ? "bg-success-soft text-success"
                            : "bg-warning-soft text-warning",
                        )}
                      >
                        {m.state === "complete" ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : (
                          <Clock3 className="size-3.5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">
                        {m.label}
                      </span>
                      {m.state === "complete" ? (
                        <span className="text-[11.5px] font-medium text-muted-foreground">
                          Done
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toast("Opening setup", { description: m.label })}
                          className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-primary hover:underline"
                        >
                          {m.action ?? "Set up"} <ChevronRight className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardShell>
            </div>

            {/* identity — bento card */}
            <div id="identity" className="scroll-mt-[118px] md:col-span-1 xl:col-span-1">
              <Surface className="h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
                      <Building2 className="size-4" />
                    </span>
                    <h2 className="text-[15px] font-semibold text-foreground">Identity</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={editHotel}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-0.5">
                  <Row label="Group" value={hotel.identity.group} />
                  <Row label="Rooms" value={hotel.identity.rooms} />
                  <Row label="Check-in" value={hotel.identity.checkIn} />
                  <Row label="Check-out" value={hotel.identity.checkOut} />
                  <Row
                    label="Hotel ID"
                    value={<span className="font-mono">{hotel.identity.hotelId}</span>}
                    action={<CopyButton value={hotel.identity.hotelId} compact />}
                  />
                  <Row label="Booking engine" value={hotel.identity.bookingEngine} />
                  <Row label="PMS" value={hotel.identity.pms} />
                  <Row label="Parent chain" value={hotel.identity.parentChain} />
                  <Row label="Added on" value={hotel.identity.addedOn} />
                </div>
              </Surface>
            </div>

            {/* people — bento card */}
            <div id="people" className="scroll-mt-[118px] md:col-span-1 xl:col-span-1">
              <Surface className="h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </span>
                    <h2 className="text-[15px] font-semibold text-foreground">People</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={editTeam}>
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  {[
                    { role: "CSM", name: hotel.people.csm },
                    { role: "Sales agent", name: hotel.people.salesAgent },
                    { role: "Referrer", name: hotel.people.referrer },
                  ].map((p) => (
                    <div key={p.role}>
                      <div className="text-[12px] text-muted-foreground">{p.role}</div>
                      <div className="text-[14.5px] font-semibold text-foreground">{p.name}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <SubTitle>Hotel emails</SubTitle>
                  {hotel.people.emails.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center">
                      <Muted>No hotel emails added yet.</Muted>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openEdit("hotel contact", [
                              { label: "Name", value: "" },
                              { label: "Role", value: "" },
                              { label: "Email", value: "" },
                            ])
                          }
                        >
                          <Plus className="size-4" /> Add contact
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {hotel.people.emails.map((e) => (
                        <div key={e.email} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[12px] text-muted-foreground">{e.role}</div>
                            <a
                              href={`mailto:${e.email}`}
                              className="block truncate text-[13.5px] font-medium text-foreground hover:text-primary hover:underline"
                            >
                              {e.email}
                            </a>
                          </div>
                          <CopyButton value={e.email} compact />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Surface>
            </div>

            {/* legal & billing — bento card */}
            <div id="legal" className="scroll-mt-[118px] md:col-span-2 xl:col-span-2">
              <Surface className="h-full">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
                    <Scale className="size-4" />
                  </span>
                  <h2 className="text-[15px] font-semibold text-foreground">Legal & billing</h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <SubTitle>Legal</SubTitle>
                      <Button variant="ghost" size="sm" onClick={editLegal}>
                        Edit
                      </Button>
                    </div>
                    {hotel.legal ? (
                      <div className="space-y-0.5">
                        <Row label="Legal name" value={hotel.legal.legalName} />
                        <Row label="Doing business as" value={hotel.legal.dba} />
                        <Row
                          label="Support email"
                          value={
                            <a
                              href={`mailto:${hotel.legal.supportEmail}`}
                              className="truncate hover:text-primary hover:underline"
                            >
                              {hotel.legal.supportEmail}
                            </a>
                          }
                          action={<CopyButton value={hotel.legal.supportEmail} compact />}
                        />
                        <Row label="EIN" value={<span className="font-mono">{hotel.legal.ein}</span>} />
                        <Row
                          label="TCR brand"
                          value={<span className="font-mono">{hotel.legal.tcrBrandId}</span>}
                        />
                        <Row
                          label="TCR campaign"
                          value={<span className="font-mono">{hotel.legal.tcrCampaignId}</span>}
                        />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border px-4 py-5 text-center">
                        <Muted>Legal information not configured.</Muted>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={editLegal}>
                            Add legal details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <SubTitle>Billing</SubTitle>
                      {hotel.legal ? (
                        <Button variant="ghost" size="sm" onClick={editBilling}>
                          Edit
                        </Button>
                      ) : null}
                    </div>
                    {hotel.legal ? (
                      <div className="space-y-4">
                        <div>
                          <div className="text-[12px] text-muted-foreground">Billing address</div>
                          <div className="text-[13.5px] font-medium text-foreground">
                            {hotel.legal.billingAddress}
                          </div>
                        </div>
                        <div>
                          <div className="text-[12px] text-muted-foreground">Invoice address</div>
                          <div className="text-[13.5px] font-medium text-foreground">
                            {hotel.legal.invoiceAddress}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Muted>Not configured.</Muted>
                    )}
                    <div className="mt-4 space-y-0.5 border-t border-border pt-1">
                      {hotel.settings
                        .filter((s) =>
                          [
                            "Plan & Billing",
                            "Billing details",
                            "Billing tax details",
                            "ACH authorization",
                            "Rate codes",
                          ].includes(s.title),
                        )
                        .map((s) => (
                          <Row
                            key={s.title}
                            label={s.title}
                            value={
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    s.title.toLowerCase(),
                                    s.rows.map((r) => ({ label: r.label, value: r.value })),
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                              >
                                View details <ChevronRight className="size-3.5" />
                              </button>
                            }
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </Surface>
            </div>

            {/* service & account — bento card */}
            <div id="service" className="scroll-mt-[118px] md:col-span-2 xl:col-span-2">
              <Surface className="h-full">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
                      <BadgeCheck className="size-4" />
                    </span>
                    <h2 className="text-[15px] font-semibold text-foreground">Service & account</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={editService}>
                    Edit
                  </Button>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <SubTitle>Service</SubTitle>
                    <StatusPill status={lifecycle.status} label={lifecycle.label.toUpperCase()} />
                    <div className="mt-4 space-y-0.5">
                      <Row label="Service started" value={hotel.service.startedOn} />
                      <Row label="Churn date" value={hotel.service.churnDate ?? "—"} />
                      <Row label="Configuration stage" value={hotel.service.configurationStage} />
                    </div>
                    <div className="mt-4 border-t border-border pt-1">
                      <Row
                        label="Management company"
                        value={
                          <button
                            type="button"
                            onClick={() =>
                              toast("Management company change", {
                                description: "Opening the transfer workflow.",
                              })
                            }
                            className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                          >
                            Start change <ChevronRight className="size-3.5" />
                          </button>
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <SubTitle>Account</SubTitle>
                    <div className="space-y-0.5">
                      <Row label="Basic account" value={hotel.service.configurationStage} />
                      <Row label="Added on" value={hotel.service.addedOn} />
                      <Row label="Set by" value={`${hotel.service.setBy} · ${hotel.service.setOn}`} />
                    </div>
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="text-[12px] text-muted-foreground">Tags</div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {hotel.service.tags.length === 0 ? (
                          <Muted>No tags added yet.</Muted>
                        ) : (
                          hotel.service.tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-medium text-foreground"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() => removeTag(t)}
                                aria-label={`Remove ${t}`}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-0.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="size-3" /> Add tag
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-56 space-y-2">
                            <Input
                              value={tagQuery}
                              onChange={(e) => setTagQuery(e.target.value)}
                              placeholder="Search tags…"
                              className="h-8"
                            />
                            <div className="space-y-1.5">
                              {tagLibrary
                                .filter((t) => t.toLowerCase().includes(tagQuery.toLowerCase()))
                                .map((t) => (
                                  <label
                                    key={t}
                                    className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-[13px] hover:bg-muted"
                                  >
                                    <Checkbox
                                      checked={hotel.service.tags.includes(t)}
                                      onCheckedChange={(c) => (c ? addTag(t) : removeTag(t))}
                                    />
                                    {t}
                                  </label>
                                ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </Surface>
            </div>

            {/* links — bento card */}
            <div id="links" className="scroll-mt-[118px] md:col-span-2 xl:col-span-2">
              <Surface className="h-full">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-[10px] bg-primary/10 text-primary">
                    <LinkIcon className="size-4" />
                  </span>
                  <h2 className="text-[15px] font-semibold text-foreground">Links & references</h2>
                </div>
                <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <SubTitle>Hotel</SubTitle>
                    <ul className="space-y-2">
                      {hotel.links
                        .filter((l) => l.label !== "Hotline")
                        .map((l) => (
                          <li key={l.label}>
                            <a
                              href={l.label === "Website" ? hotel.website : l.href}
                              target={l.label === "Website" ? "_blank" : undefined}
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[13.5px] text-foreground hover:text-primary hover:underline"
                            >
                              {l.label}
                              <ExternalLink className="size-3.5 text-muted-foreground" />
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <SubTitle>Contact</SubTitle>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href="tel:+19545337846"
                          className="inline-flex items-center gap-1.5 text-[13.5px] text-foreground hover:text-primary hover:underline"
                        >
                          <Phone className="size-3.5 text-muted-foreground" /> (954) 533-7846
                        </a>
                      </li>
                      <li>
                        <Muted>Hotline · front desk</Muted>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <SubTitle>Product</SubTitle>
                    <ul className="space-y-2">
                      <li>
                        <a
                          href={hotel.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-[13.5px] text-foreground hover:text-primary hover:underline"
                        >
                          Booking engine · {hotel.identity.bookingEngine}
                          <ExternalLink className="size-3.5 text-muted-foreground" />
                        </a>
                      </li>
                      <li>
                        <a
                          href="#guest-landing"
                          className="inline-flex items-center gap-1.5 text-[13.5px] text-foreground hover:text-primary hover:underline"
                        >
                          Guest landing page
                          <ExternalLink className="size-3.5 text-muted-foreground" />
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <SubTitle>Messaging</SubTitle>
                    <ul className="space-y-2 text-[13.5px] text-foreground">
                      <li className="flex items-center gap-1.5">
                        Proxy numbers <Muted>· (954) 408-4642</Muted>
                      </li>
                      <li className="flex items-center gap-1.5">
                        Hosted messaging <Muted>· Not started</Muted>
                      </li>
                    </ul>
                  </div>
                </div>
              </Surface>
            </div>
          </div>
        </main>
      </div>

      {/* ---------------- drawers ---------------- */}
      <EditDrawer target={edit} onOpenChange={(o) => !o && setEdit(null)} />

      <Sheet open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b border-border px-6 py-5">
            <SheetTitle>
              {detail === "features"
                ? "Feature status"
                : detail === "jobs"
                  ? "PMS sync jobs"
                  : "Onboarding steps"}
            </SheetTitle>
            <SheetDescription>
              {detail === "features"
                ? `${hotel.health.healthy} / ${hotel.health.total} healthy`
                : detail === "jobs"
                  ? `Last run ${hotel.localTime} · ${hotel.sync.pms}`
                  : hotel.onboarding?.stage}
            </SheetDescription>
          </SheetHeader>

          <div className="px-6 py-5">
            {detail === "features" ? (
              <div className="space-y-5">
                {hotel.health.groups.map((g) => (
                  <div key={g.label}>
                    <SubTitle>{g.label}</SubTitle>
                    <div className="space-y-0.5">
                      {g.features.map((f) => (
                        <Row
                          key={f.name}
                          label={f.name}
                          value={<StatusDot status={f.status} label={healthWord[f.status]} />}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {detail === "jobs" ? (
              hotel.sync.jobs.length ? (
                <div className="space-y-0.5">
                  {hotel.sync.jobs.map((j) => (
                    <Row
                      key={j.name}
                      label={j.name}
                      value={<StatusDot status={j.status} label={healthWord[j.status]} />}
                    />
                  ))}
                </div>
              ) : (
                <Muted>No PMS jobs are configured for this hotel yet.</Muted>
              )
            ) : null}

            {detail === "onboarding" && hotel.onboarding ? (
              <div className="space-y-6">
                <div>
                  <SubTitle>Mandatory steps</SubTitle>
                  <div className="space-y-0.5">
                    {hotel.onboarding.mandatory.map((m) => (
                      <Row
                        key={m.label}
                        label={m.label}
                        value={
                          m.state === "complete" ? (
                            <StatusDot status="healthy" label="Done" />
                          ) : (
                            <span className="text-[13px] font-semibold text-primary">
                              {m.action ?? "Set up"}
                            </span>
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <SubTitle>Optional</SubTitle>
                  <div className="space-y-0.5">
                    {hotel.onboarding.optional.map((o) => (
                      <Row key={o.label} label={o.label} value={o.value} />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
