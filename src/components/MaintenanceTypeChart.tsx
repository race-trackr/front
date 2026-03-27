import { FC, useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { MaintenanceRecordType, MaintenanceRecordTypeType } from '@/types'

interface MaintenanceTypeChartProps {
  maintenances: MaintenanceRecordType[]
}

const COLORS: Record<MaintenanceRecordTypeType, string> = {
  maintenance: '#82ca9d',
  repair: '#ff7f7f',
  modification: '#8884d8',
  other: '#ffc658',
}

const TYPES: MaintenanceRecordTypeType[] = ['maintenance', 'repair', 'modification', 'other']

const MaintenanceTypeChart: FC<MaintenanceTypeChartProps> = ({ maintenances }) => {
  const { t } = useTranslation()

  const data = useMemo(() => {
    const counts: Record<MaintenanceRecordTypeType, number> = {
      maintenance: 0,
      repair: 0,
      modification: 0,
      other: 0,
    }

    maintenances.forEach((m) => {
      if (m.type in counts) counts[m.type]++
    })

    return TYPES.filter((type) => counts[type] > 0).map((type) => ({
      name: t(`maintenance_type_${type}`),
      value: counts[type],
      color: COLORS[type],
    }))
  }, [maintenances, t])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('maintenance_by_type')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">{t('no_maintenance_data_for_chart')}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default MaintenanceTypeChart
