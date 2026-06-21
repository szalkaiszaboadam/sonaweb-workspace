import type { Metadata } from 'next'
import { client } from '@/lib/data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SonawebLogo } from '@/components/sonaweb-logo'
import { VipMembership } from '@/components/vip-membership'
import { Nfc, User, Bell, CreditCard, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Settings — SONAWEB',
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input defaultValue={defaultValue} className="bg-secondary/40" />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, branding, and notification preferences.
        </p>
      </header>

      {/* NFC Card */}
      <Card className="overflow-hidden border-border/60 bg-card p-0">
        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Nfc className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Your SONAWEB NFC Card</h2>
              <Badge className="ml-auto bg-primary/15 text-primary hover:bg-primary/15">
                Active
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your branded smart card links directly to this portal. Tap to share
              your digital profile, website, and social channels instantly.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Display Name" defaultValue={client.name} />
              <Field label="Card ID" defaultValue={client.cardId} />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Request Re-Print
            </Button>
          </div>

          {/* Card visual */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-secondary to-background p-8">
            <div className="relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-secondary p-6 shadow-2xl shadow-primary/10 ring-1 ring-inset ring-white/5">
              <div className="flex items-start justify-between">
                <SonawebLogo />
                <Nfc className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-10 space-y-1">
                <p className="text-lg font-semibold tracking-tight">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.contact}</p>
              </div>
              <p className="mt-4 font-mono text-xs tracking-widest text-primary/80">
                {client.cardId}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Loyalty & VIP membership */}
      <VipMembership />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card className="space-y-4 border-border/60 bg-card p-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Profile</h2>
          </div>
          <div className="grid gap-3">
            <Field label="Company Name" defaultValue={client.name} />
            <Field label="Primary Contact" defaultValue={client.contact} />
            <Field label="Email" defaultValue="mara@aurelia-studio.com" />
            <Field label="Phone" defaultValue="+1 (415) 555-0148" />
          </div>
          <Button variant="secondary">Save Changes</Button>
        </Card>

        {/* Notifications & Billing */}
        <div className="space-y-6">
          <Card className="space-y-4 border-border/60 bg-card p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Notifications</h2>
            </div>
            {[
              'Content ready for approval',
              'Campaign performance reports',
              'New invoices and receipts',
              'Project milestone updates',
            ].map((item, i) => (
              <div key={item}>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">{item}</span>
                  <span
                    className={`flex h-5 w-9 items-center rounded-full px-0.5 transition-colors ${
                      i === 3 ? 'justify-start bg-secondary' : 'justify-end bg-primary'
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-foreground" />
                  </span>
                </div>
                {i < 3 && <Separator className="bg-border/60" />}
              </div>
            ))}
          </Card>

          <Card className="space-y-4 border-border/60 bg-card p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Billing</h2>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-12 items-center justify-center rounded bg-foreground/10 text-[10px] font-semibold">
                  VISA
                </div>
                <span className="text-sm">•••• 4471</span>
              </div>
              <Button variant="ghost" size="sm">
                Update
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Secured with bank-level encryption
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
