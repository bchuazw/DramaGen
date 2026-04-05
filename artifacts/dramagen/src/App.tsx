import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Generate from "@/pages/generate";
import Gallery from "@/pages/gallery";
import About from "@/pages/about";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground dark selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main className="flex-1 w-full relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/generate" component={Generate} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/about" component={About} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
