import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface StatsCardsProps {
  totalPerizinan: number
  prosesPerizinan: number
  selesaiPerizinan: number
  terlambatPerizinan: number
}

export function StatsCards({ totalPerizinan, prosesPerizinan, selesaiPerizinan, terlambatPerizinan }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Perizinan",
      value: totalPerizinan,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Dalam Proses",
      value: prosesPerizinan,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Selesai",
      value: selesaiPerizinan,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Terlambat",
      value: terlambatPerizinan,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
