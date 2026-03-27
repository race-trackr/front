import { FC, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { MaintenanceRecordType } from '@/types'

interface MaintenanceCostChartProps {
  maintenances: MaintenanceRecordType[]
}

const MaintenanceCostChart: FC<MaintenanceCostChartProps> = ({ maintenances }) => {
  const { t, i18n } = useTranslation()

  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr
      case 'es':
        return es
      case 'it':
        return it
      default:
        return enUS
    }
  }

  const aggregatedData = useMemo(() => {
    const monthlyCosts: { [key: string]: { displayDate: string; cost: number } } = {}

    maintenances.forEach((m) => {
      const date = new Date(m.date)
      const sortKey = format(date, 'yyyy-MM')
      const displayDate = format(date, 'MMM yyyy', { locale: getLocale() })

      if (!monthlyCosts[sortKey]) {
        monthlyCosts[sortKey] = { displayDate, cost: 0 }
      }
      monthlyCosts[sortKey].cost += Number(m.cost) || 0
    })

    const sortedData = Object.keys(monthlyCosts)
      .sort()
      .map((key) => ({
        name: monthlyCosts[key].displayDate,
        cost: monthlyCosts[key].cost,
      }))

    return sortedData
  }, [maintenances, i18n.language])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('maintenance_cost_over_time')}</CardTitle>
      </CardHeader>
      <CardContent>
        {aggregatedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={aggregatedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any) =>
                  typeof value === 'number' ? `${value.toFixed(2)}€` : value
                }
              />
              <Legend />
              <Bar dataKey="cost" fill="#82ca9d" name={t('total_cost')} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">{t('no_maintenance_data_for_chart')}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default MaintenanceCostChart
