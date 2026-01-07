import { auth } from '@clerk/nextjs/server';
import { getAccounts, getTransactions } from '@/lib/bank-service';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankAccount, Transaction } from '@/lib/bank-service';
import { format } from 'date-fns';
import { SyncButton } from '@/components/sync-button';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const accounts = getAccounts(userId);
  const transactions = getTransactions(userId);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Private Banker
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Your financial empire at a glance.</p>
        </div>
        <SyncButton />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </section>

      <section className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 overflow-hidden shadow-xl">
        <h2 className="text-2xl font-semibold mb-6 px-2">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground uppercase text-xs tracking-widest">
                <th className="pb-4 px-4">Date</th>
                <th className="pb-4 px-4">Description</th>
                <th className="pb-4 px-4">Category</th>
                <th className="pb-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.slice(0, 10).map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AccountCard({ account }: { account: BankAccount }) {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {account.name}
        </CardTitle>
        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
          🏦
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {account.balance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{account.currencyCode}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {account.accountNumber}
        </p>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isNegative = transaction.amount < 0;
  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="py-4 px-4 text-sm text-zinc-400">
        {format(transaction.date, 'MMM dd, yyyy')}
      </td>
      <td className="py-4 px-4 font-medium">
        {transaction.description}
      </td>
      <td className="py-4 px-4">
        <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-tighter">
          {transaction.category || 'General'}
        </span>
      </td>
      <td className={`py-4 px-4 text-right font-bold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
        {isNegative ? '-' : '+'}{Math.abs(transaction.amount).toLocaleString()} {transaction.currencyCode}
      </td>
    </tr>
  );
}
