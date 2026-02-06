import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { 
  Plane, 
  Cloud, 
  TrendingUp, 
  Shield, 
  Zap, 
  BarChart3, 
  CheckCircle2,
  ArrowRight,
  Brain,
  Clock,
  AlertTriangle,
  Target,
  Globe,
  Users
} from "lucide-react";

export function LandingPage() {
  const scrollToHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">Flight Risk AI</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="font-medium shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
              <Zap className="h-3 w-3 mr-1.5" />
              Powered by AI
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Predict Low Visibility
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Flight Delays Before They Happen
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Advanced AI-powered delay prediction platform that combines real-time weather intelligence, 
              operational feasibility analysis, and explainable ML to minimize disruptions and maximize operational efficiency.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl transition-all">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works" onClick={scrollToHowItWorks}>
                <Button size="lg" variant="outline" className="h-12 px-8 font-semibold">
                  See How It Works
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">95%+</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Real-Time Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Flight Operations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive delay prediction and operational intelligence platform built for modern aviation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  AI-Powered Predictions
                </h3>
                <p className="text-muted-foreground">
                  Random Forest classifier with 98.3% accuracy, trained on comprehensive weather and operational data.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <Cloud className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Real-Time Weather Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Integrated TAF/METAR data with visibility timelines and deterministic fallback chains.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Operational Feasibility
                </h3>
                <p className="text-muted-foreground">
                  ILS category assessment and CAT I/II/III minima evaluation for origin and destination airports.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  SHAP Explainability
                </h3>
                <p className="text-muted-foreground">
                  Transparent ML predictions with SHAP values showing feature impact on delay probability.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <AlertTriangle className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Smart Decision Engine
                </h3>
                <p className="text-muted-foreground">
                  Automated operational recommendations from No Action to Proactive Reschedule based on risk.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border shadow-md hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-8">
                <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Enterprise Security
                </h3>
                <p className="text-muted-foreground">
                  Secure cloud storage, role-based access control, and audit logging.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How Flight Risk AI Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive pipeline from flight data to actionable operational recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-md h-full">
                <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Flight Resolution
                </h3>
                <p className="text-muted-foreground text-sm">
                  Input flight number and date. System resolves flight details via AeroDataBox API.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-md h-full">
                <div className="h-12 w-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Weather Intelligence
                </h3>
                <p className="text-muted-foreground text-sm">
                  Fetch TAF/METAR data for origin and destination with visibility analysis.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-md h-full">
                <div className="h-12 w-12 bg-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  3
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  ML Prediction
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our model predicts delay probability with SHAP explainability.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-md h-full">
                <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                  4
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Recommendations
                </h3>
                <p className="text-muted-foreground text-sm">
                  Decision engine provides operational guidance based on risk assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center text-white">
            <div>
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-2">Global Coverage</div>
              <div className="text-blue-100">
                Access to worldwide airport and weather data
              </div>
            </div>
            <div>
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-2">Real-Time Updates</div>
              <div className="text-blue-100">
                Live TAF/METAR data refreshed continuously
              </div>
            </div>
            <div>
              <Users className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <div className="text-4xl font-bold mb-2">Trusted By Airlines</div>
              <div className="text-blue-100">
                Used by operations teams worldwide
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Why Airlines Choose Flight Risk AI
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Make data-driven operational decisions with confidence. Our platform combines cutting-edge 
                machine learning with aviation domain expertise.
              </p>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Reduce Operational Costs</h4>
                    <p className="text-muted-foreground text-sm">
                      Minimize unnecessary delays and optimize resource allocation with predictive insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Improve Passenger Experience</h4>
                    <p className="text-muted-foreground text-sm">
                      Proactive communication and rebooking reduce passenger frustration and complaints.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Explainable AI Decisions</h4>
                    <p className="text-muted-foreground text-sm">
                      Understand exactly why predictions are made with SHAP feature importance analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">FastAPI Performance</h4>
                    <p className="text-muted-foreground text-sm">
                      Lightning-fast predictions delivered through modern RESTful API architecture.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="border-border shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                          <Plane className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">AA1234</div>
                          <div className="text-sm text-muted-foreground">JFK → LAX</div>
                        </div>
                      </div>
                      <Badge variant="destructive" className="px-3 py-1">
                        High Risk
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Delay Probability
                        </div>
                        <div className="text-3xl font-bold text-red-600">78%</div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Origin Visibility
                        </div>
                        <div className="text-lg font-semibold text-foreground">800m</div>
                      </div>

                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Recommendation
                        </div>
                        <Badge variant="destructive" className="font-medium">
                          MONITOR AND PREPARE
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Top Contributing Factors
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Origin Visibility</span>
                          <span className="font-semibold text-foreground">+0.24</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Destination Weather</span>
                          <span className="font-semibold text-foreground">+0.18</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Time of Day</span>
                          <span className="font-semibold text-foreground">+0.12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Flight Operations?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Join leading airlines using AI-powered predictions to minimize delays and maximize efficiency.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-foreground">Flight Risk AI</span>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2026 Flight Risk AI. All rights reserved.
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
              Made with love by Kanak Raj Arora
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}