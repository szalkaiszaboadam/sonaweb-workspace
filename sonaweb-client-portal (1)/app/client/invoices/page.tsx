import { PageHeader } from '@/components/portal-shell'
import { StatCard } from '@/components/stat-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { invoices } from '@/lib/data'
import { Download, CreditCard } from 'lucide-react'

export default function InvoicesPage() {
  const due = invoices.filter((i) => i.status === 'Due')
  const paid = invoices.reduce(
    (s, i) => (i.status === 'Paid' ? s + i.amount : s),
    0,
  )

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Billing history, outstanding balances and downloadable receipts."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Paid" value={`$${paid.toLocaleString()}`} sub="this year" />
        <StatCard
          label="Outstanding"
          value={`$${due.reduce((s, i) => s + i.amount, 0).toLocaleString()}`}
          sub={`${due.length} invoice${due.length === 1 ? '' : 's'}`}
        />
        <StatCard label="Payment Method" value="•••• 4242" sub="Visa" />
        <StatCard label="Next Billing" value="Sep 1" sub="$2,250" />
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-sm font-semibold text-foreground">All Invoices</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 font-medium">Invoice</th>
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Amount</th>
                <th className="pb-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50">
                  <td className="py-3 font-mono text-xs text-foreground">
                    {inv.id}
                  </td>
                  <td className="py-3 text-foreground">{inv.service}</td>
                  <td className="py-3 text-muted-foreground">{inv.date}</td>
                  <td className="py-3">
                    <Badge
                      variant={inv.status === 'Paid' ? 'default' : 'outline'}
                      className="text-[10px]"
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-right font-semibold text-foreground">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    {inv.status === 'Due' ? (
                      <Button size="sm" className="h-7 gap-1 text-xs">
                        <CreditCard className="h-3 w-3" /> Pay
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
