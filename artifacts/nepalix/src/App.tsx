import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

import Home from "@/pages/home";
import Product from "@/pages/product";
import Pricing from "@/pages/pricing";
import Solutions from "@/pages/solutions";
import Plugins from "@/pages/plugins";
import CaseStudies from "@/pages/case-studies";
import Compare from "@/pages/compare";
import About from "@/pages/about";
import BookDemo from "@/pages/book-demo";
import Contact from "@/pages/contact";
import Docs from "@/pages/docs";
import Dashboard from "@/pages/dashboard";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isDashboard = location === "/dashboard";

  return (
    <div className="flex flex-col min-h-screen bg-[#070B14]">
      <ScrollToTop />
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "flex-1" : "flex-1"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/product" component={Product} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/case-studies" component={CaseStudies} />
      <Route path="/compare" component={Compare} />
      <Route path="/about" component={About} />
      <Route path="/book-demo" component={BookDemo} />
      <Route path="/contact" component={Contact} />
      <Route path="/docs" component={Docs} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <AuthProvider>
            <AppShell>
              <Router />
            </AppShell>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
