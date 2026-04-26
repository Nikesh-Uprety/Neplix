import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldAlert,
  Loader2,
  Receipt,
  Crown,
  Store,
  LayoutDashboard,
  Rocket,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  api,
  type Plan,
  type PlanSlug,
  type Payment,
  type SubscriptionStatus,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function formatNPR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function statusChipClasses(status: SubscriptionStatus | Payment["status"]): string {
  switch (status) {
    case "trialing":
      return "bg-amber-100 border-amber-300 text-amber-800";
    case "active":
    case "verified":
      return "bg-green-100 border-green-300 text-green-800";
    case "past_due":
      return "bg-orange-100 border-orange-300 text-orange-800";
    case "pending":
      return "bg-blue-100 border-blue-300 text-blue-800";
    case "failed":
      return "bg-red-100 border-red-300 text-red-800";
    case "canceled":
    case "expired":
    default:
      return "bg-gray-100 border-gray-300 text-gray-700";
  }
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const label =
    status === "trialing"
      ? "Trial"
      : status === "active"
        ? "Active"
        : status === "past_due"
          ? "Past due"
          : status === "canceled"
            ? "Canceled"
            : "Expired";
  const Icon =
    status === "trialing"
      ? Clock
      : status === "active"
        ? CheckCircle2
        : status === "past_due"
          ? AlertTriangle
          : XCircle;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${statusChipClasses(status)}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: Payment["status"] }) {
  const label =
    status === "verified" ? "Verified" : status === "pending" ? "Pending" : "Failed";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${statusChipClasses(status)}`}
    >
      {label}
    </span>
  );
}

function buildFeatureBullets(plan: Plan): string[] {
  const f = plan.features;
  const bullets: string[] = [];
  bullets.push(
    f.ordersPerYear === null
      ? "Unlimited orders / year"
      : `${f.ordersPerYear.toLocaleString()} orders / year`,
  );
  bullets.push(
    f.products === null ? "Unlimited products" : `${f.products.toLocaleString()} products`,
  );
  bullets.push(f.staff === null ? "Unlimited staff" : `${f.staff} staff accounts`);
  bullets.push(
    f.locations === null
      ? "Unlimited locations"
      : `${f.locations} location${f.locations === 1 ? "" : "s"}`,
  );
  if (f.pos) bullets.push("Point of Sale (POS)");
  if (f.advancedInventory) bullets.push("Advanced inventory");
  if (f.abandonedCart) bullets.push("Abandoned cart recovery");
  if (f.funnelBuilder) bullets.push("Funnel builder");
  if (f.upsellCrossSell) bullets.push("Upsell & cross-sell");
  bullets.push(`${f.analyticsLevel[0]!.toUpperCase()}${f.analyticsLevel.slice(1)} analytics`);
  if (f.prioritySupport) bullets.push("Priority support");
  if (f.customIntegrations) bullets.push("Custom integrations");
  if (f.dedicatedManager) bullets.push("Dedicated account manager");
  return bullets;
}

export default function Billing() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const fromOnboarding = searchStr.includes("from=onboarding");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [trialLoading, setTrialLoading] = useState<PlanSlug | null>(null);
  const [trialSuccess, setTrialSuccess] = useState<PlanSlug | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthLoading, isAuthenticated, setLocation]);

  const plansQuery = useQuery({
    queryKey: ["plans"],
    queryFn: () => api.plans.list(),
    enabled: isAuthenticated,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => api.subscriptions.current(),
    enabled: isAuthenticated,
  });

  const paymentsQuery = useQuery({
    queryKey: ["subscription", "payments"],
    queryFn: () => api.subscriptions.payments(),
    enabled: isAuthenticated,
  });

  const storesQuery = useQuery({
    queryKey: ["auth", "stores"],
    queryFn: () => api.auth.stores(),
    enabled: isAuthenticated,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.subscriptions.cancel(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
      queryClient.invalidateQueries({ queryKey: ["subscription", "payments"] });
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You'll retain access until the end of the current period.",
      });
    },
    onError: (err: unknown) => {
      toast({
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => setCancelling(false),
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#F9F3E8] to-[#FFF8E7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1A0D00]/20 border-t-[#1A0D00] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const subscription = subscriptionQuery.data?.subscription ?? null;
  const plans = (plansQuery.data?.plans ?? [])
    .filter((p) => p.slug !== "free" && p.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const payments = paymentsQuery.data?.payments ?? [];
  const storeSlug = storesQuery.data?.stores?.[0]?.slug ?? null;

  const currentSlug = subscription?.plan?.slug ?? null;
  const canCancel =
    subscription && (subscription.status === "trialing" || subscription.status === "active");
  const isActivePaid = subscription?.status === "active";

  const trialDaysLeft =
    subscription?.status === "trialing" && subscription.trialEndsAt
      ? daysBetween(new Date(), new Date(subscription.trialEndsAt))
      : null;

  const totalTrialDays = 14;
  const trialProgress =
    trialDaysLeft !== null ? Math.max(0, Math.min(100, (trialDaysLeft / totalTrialDays) * 100)) : 0;

  async function handleStartTrial(planSlug: PlanSlug) {
    setTrialLoading(planSlug);
    try {
      await api.subscriptions.startTrial(planSlug);
      setTrialSuccess(planSlug);
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
      toast({ title: "Trial started!", description: `Your 14-day ${planSlug} trial is now active.` });
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 1500);
    } catch (err: unknown) {
      toast({
        title: "Could not start trial",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setTrialLoading(null);
    }
  }

  function handleCancel() {
    const ok = window.confirm(
      "Cancel your subscription? You'll keep access until the end of your current billing period.",
    );
    if (!ok) return;
    setCancelling(true);
    cancelMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E7] via-[#F9F3E8] to-[#FFF8E7]">
      {/* Header strip matching onboarding */}
      <div className="border-b border-[#1A0D00]/10 bg-[#FFF8E7]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#5C4633] hover:text-[#1A0D00] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-semibold text-[#5C4633] uppercase tracking-widest">
            Billing &amp; Plans
          </span>
          {storeSlug && (
            <Link
              href={`/store/${storeSlug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A0D00] hover:underline"
            >
              <Store className="w-4 h-4" />
              View Store
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1A0D00] mb-2">
              {fromOnboarding ? "🎉 Your store is live!" : "Billing & Subscription"}
            </h1>
            <p className="text-[#5C4633]">
              {fromOnboarding
                ? "Choose a plan to unlock your full potential, or explore your store first."
                : "Manage your plan, payments and billing history."}
              {user?.email && (
                <> Signed in as <span className="font-medium text-[#1A0D00]">{user.email}</span>.</>
              )}
            </p>
          </div>

          {/* CTA row — always visible, prominent on onboarding */}
          <div
            className={`flex flex-col sm:flex-row gap-3 mb-8 ${
              fromOnboarding ? "justify-center" : "justify-start"
            }`}
          >
            {storeSlug && (
              <Link
                href={`/store/${storeSlug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1A0D00] text-[#FFF8E7] font-semibold text-sm hover:bg-[#2D1A0E] transition-colors shadow-sm"
              >
                <Store className="w-4 h-4" />
                View Your Store Live
              </Link>
            )}
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-[#1A0D00]/20 text-[#1A0D00] font-semibold text-sm hover:bg-[#1A0D00]/5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>

          {/* Current plan card */}
          <div className="mb-8 rounded-2xl border border-[#1A0D00]/12 bg-white/80 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#1A0D00]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[#1A0D00]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#5C4633] font-semibold mb-1">
                    Current plan
                  </p>
                  {subscriptionQuery.isLoading ? (
                    <div className="h-6 w-40 bg-[#1A0D00]/5 rounded animate-pulse" />
                  ) : subscription ? (
                    <>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-[#1A0D00]">
                          {subscription.plan?.name ?? subscription.planSlug}
                        </h2>
                        <StatusBadge status={subscription.status} />
                      </div>
                      <div className="mt-2 text-sm text-[#5C4633] space-y-1">
                        {subscription.status === "trialing" && subscription.trialEndsAt && (
                          <>
                            <p>
                              Trial ends {formatDate(subscription.trialEndsAt)} —{" "}
                              <span className="font-semibold text-amber-700">
                                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left
                              </span>
                            </p>
                            <div className="w-full max-w-xs bg-[#1A0D00]/10 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${trialProgress}%` }}
                              />
                            </div>
                          </>
                        )}
                        {subscription.status !== "trialing" && subscription.currentPeriodEnd && (
                          <p>
                            {subscription.status === "canceled" ? "Access ends " : "Renews on "}
                            {formatDate(subscription.currentPeriodEnd)}
                          </p>
                        )}
                        {subscription.plan && subscription.plan.yearlyPrice > 0 && (
                          <p className="text-[#5C4633]">
                            {formatNPR(subscription.plan.yearlyPrice)} / year
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-[#1A0D00]">No active subscription</h2>
                      <p className="mt-2 text-sm text-[#5C4633]">
                        Start a free trial below to unlock Nepalix.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {!subscription && (
                <a
                  href="#plans"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A0D00] text-[#FFF8E7] font-semibold text-sm hover:bg-[#2D1A0E] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Start your free trial
                </a>
              )}
            </div>
          </div>

          {/* Plans grid */}
          <div id="plans" className="mb-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#1A0D00]">Choose your plan</h2>
              <p className="text-sm text-[#5C4633]">
                Start a 14-day free trial on any plan. No payment required.
              </p>
            </div>

            {plansQuery.isLoading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-[#1A0D00]/5 border border-[#1A0D00]/10 animate-pulse"
                  />
                ))}
              </div>
            ) : plansQuery.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Could not load plans. Please refresh.
              </div>
            ) : plans.length === 0 ? (
              <div className="rounded-2xl border border-[#1A0D00]/10 bg-white/80 p-6 text-sm text-[#5C4633]">
                No plans are available right now. Please check back soon.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrent = currentSlug === plan.slug;
                  const bullets = buildFeatureBullets(plan);
                  const isLoadingThis = trialLoading === plan.slug;
                  const isSuccessThis = trialSuccess === plan.slug;
                  const anyTrialLoading = trialLoading !== null;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-6 border flex flex-col transition-all ${
                        isCurrent
                          ? "border-[#1A0D00]/40 bg-[#1A0D00] shadow-lg"
                          : "border-[#1A0D00]/12 bg-white/90 hover:border-[#1A0D00]/25 hover:shadow-sm"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-[#1A0D00] text-xs font-bold shadow">
                          <Crown className="w-3.5 h-3.5" />
                          Current plan
                        </span>
                      )}

                      <div className="mb-4">
                        <h3 className={`text-lg font-bold ${isCurrent ? "text-[#FFF8E7]" : "text-[#1A0D00]"}`}>
                          {plan.name}
                        </h3>
                        {plan.tagline && (
                          <p className={`text-xs mt-0.5 ${isCurrent ? "text-[#FFF8E7]/60" : "text-[#5C4633]"}`}>
                            {plan.tagline}
                          </p>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-bold ${isCurrent ? "text-[#FFF8E7]" : "text-[#1A0D00]"}`}>
                            {formatNPR(plan.yearlyPrice)}
                          </span>
                          <span className={`text-sm ${isCurrent ? "text-[#FFF8E7]/50" : "text-[#5C4633]"}`}>
                            / year
                          </span>
                        </div>
                        {plan.monthlyPrice !== null && (
                          <p className={`text-xs mt-1 ${isCurrent ? "text-[#FFF8E7]/50" : "text-[#5C4633]"}`}>
                            or {formatNPR(plan.monthlyPrice)} / month
                          </p>
                        )}
                      </div>

                      <ul className="space-y-2 mb-6 flex-1">
                        {bullets.map((b) => (
                          <li
                            key={b}
                            className={`flex items-start gap-2 text-sm ${isCurrent ? "text-[#FFF8E7]/80" : "text-[#5C4633]"}`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCurrent ? "text-amber-300" : "text-[#1A0D00]/60"}`}
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <div
                          className={`px-4 py-2.5 rounded-xl text-sm text-center font-medium ${
                            isActivePaid
                              ? "bg-[#FFF8E7]/15 text-[#FFF8E7]"
                              : "bg-[#FFF8E7]/10 text-[#FFF8E7]/70"
                          }`}
                        >
                          {isActivePaid ? "Active subscription" : "Your current trial plan"}
                        </div>
                      ) : isSuccessThis ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-100 border border-green-200 text-green-800 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Trial started!
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={anyTrialLoading || isActivePaid}
                          onClick={() => void handleStartTrial(plan.slug as PlanSlug)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#1A0D00] text-[#FFF8E7] font-semibold text-sm hover:bg-[#2D1A0E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoadingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Rocket className="w-4 h-4" />
                          )}
                          {isLoadingThis ? "Starting trial..." : `Start ${plan.name} Free Trial`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment history */}
          <div className="mb-8 rounded-2xl border border-[#1A0D00]/12 bg-white/80 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1A0D00]/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[#1A0D00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A0D00]">Payment history</h2>
                <p className="text-xs text-[#5C4633]">
                  Your last {payments.length > 0 ? payments.length : ""} payment
                  {payments.length === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

            {paymentsQuery.isLoading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-[#1A0D00]/5 animate-pulse" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-[#5C4633]">No payments yet.</p>
                <p className="text-xs text-[#5C4633]/60 mt-1">
                  Once you subscribe to a plan, your payments will show up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-widest text-[#5C4633] border-b border-[#1A0D00]/10">
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Provider</th>
                      <th className="pb-3 pr-4 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-[#1A0D00]/6 last:border-0">
                        <td className="py-3 pr-4 text-[#1A0D00] whitespace-nowrap">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-[#1A0D00] capitalize">{p.provider}</td>
                        <td className="py-3 pr-4 text-[#1A0D00] whitespace-nowrap font-medium">
                          {formatNPR(p.amount)}
                        </td>
                        <td className="py-3">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Danger zone */}
          {canCancel && (
            <div className="rounded-2xl p-6 border border-red-200 bg-red-50">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-800">Danger zone</h2>
                  <p className="text-sm text-red-700 mt-0.5">
                    Cancel your subscription. You'll retain access until{" "}
                    {formatDate(
                      subscription?.trialEndsAt ?? subscription?.currentPeriodEnd ?? null,
                    )}
                    .
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling || cancelMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 hover:bg-red-200"
              >
                {cancelling || cancelMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  "Cancel subscription"
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
