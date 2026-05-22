import { Link } from 'react-router-dom';
import { Activity, CalendarCheck, FileText, HeartPulse, Lock, Pill, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Zap,
    title: 'Seizure tracking',
    description: 'Record seizure type, duration, severity, triggers, and notes in one place.',
  },
  {
    icon: Pill,
    title: 'Medication routines',
    description: 'Keep medication schedules, refill dates, and daily taken status close at hand.',
  },
  {
    icon: FileText,
    title: 'Reports for care',
    description: 'Turn your logs into summaries you can review before appointments.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground">SeizureTrack</p>
              <p className="text-xs text-muted-foreground">Health Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button className="btn-gradient" asChild>
              <Link to="/login?mode=sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-14 lg:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">
                <HeartPulse className="w-4 h-4" />
                Built for everyday seizure care tracking
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Track seizures, medicines, and appointments with less friction.
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  SeizureTrack helps you keep health events organized so patterns are easier to notice and reports are easier to share with your care team.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="btn-gradient" asChild>
                  <Link to="/login?mode=sign-up">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="rounded-xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="font-display font-semibold text-foreground">Care Overview</p>
                  </div>
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="grid gap-3">
                  <div className="rounded-lg bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-warning" />
                      <span className="font-medium">Seizure log</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Triggers saved</span>
                  </div>
                  <div className="rounded-lg bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="w-5 h-5 text-primary" />
                      <span className="font-medium">Medication</span>
                    </div>
                    <span className="text-sm text-muted-foreground">2 doses today</span>
                  </div>
                  <div className="rounded-lg bg-background p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="w-5 h-5 text-accent" />
                      <span className="font-medium">Appointments</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Next visit ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/35">
          <div className="container mx-auto px-4 py-12">
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="card-elevated">
                  <CardContent className="p-6">
                    <feature.icon className="w-8 h-8 text-primary mb-4" />
                    <h2 className="font-display font-semibold text-lg text-foreground mb-2">
                      {feature.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
