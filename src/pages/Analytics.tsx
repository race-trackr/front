import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getTrackdays } from '@/lib/api/trackdays'
import { getVehicles } from '@/lib/api/vehicles'
import { getTracks } from '@/lib/api/tracks'
import { DatePicker } from '@/components/ui/date-picker'
import { Combobox } from '@/components/ui/combobox'
import { format } from 'date-fns'
import { fr, enUS, es, it } from 'date-fns/locale'
import { UserVehicleType, TrackType, TrackDayType, PaginatedResponse } from '@/types'
import { Flag, Map, GaugeCircle, Route, X, Timer, TrendingDown, Clock } from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────

const CHRONO_RE = /^(\d{1,2})\.(\d{2})\.(\d{3})$/

function lapToSeconds(lapTime: string): number {
  const parts = lapTime.split('.')
  if (parts.length !== 3) return 0
  return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 1000
}

function formatTotalTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

function secondsToDisplay(s: number): string {
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.round((s - Math.floor(s)) * 1000)
  return `${String(min).padStart(2, '0')}.${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`
}

const CHART_COLORS = [
  'hsl(15 86% 53%)',
  'hsl(221 83% 53%)',
  'hsl(142 71% 45%)',
  'hsl(262 83% 58%)',
  'hsl(45 93% 47%)',
  'hsl(328 86% 56%)',
]

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  sub?: string
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, sub }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className=" text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
          {sub && <p className=" text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// ─── Custom lap time tooltip ──────────────────────────────────────────────────

const LapTimeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2  shadow-xl">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-mono font-semibold text-foreground ml-auto pl-4">
            {secondsToDisplay(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const Analytics: React.FC = () => {
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

  // Filters
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<number | undefined>()
  const [selectedTrackId, setSelectedTrackId] = React.useState<number | undefined>()
  const [startDate, setStartDate] = React.useState<Date | undefined>()
  const [endDate, setEndDate] = React.useState<Date | undefined>()

  const hasFilters = !!(selectedVehicleId || selectedTrackId || startDate || endDate)

  const resetFilters = () => {
    setSelectedVehicleId(undefined)
    setSelectedTrackId(undefined)
    setStartDate(undefined)
    setEndDate(undefined)
  }

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: trackdaysRaw = [], isLoading: loadingTD } = useQuery<TrackDayType[]>({
    queryKey: ['trackdays', 'analytics'],
    queryFn: () => getTrackdays({ limit: 0 }).then((r) => r.data),
  })

  const { data: vehiclesResp, isLoading: loadingV } = useQuery<PaginatedResponse<UserVehicleType>>({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles({ limit: 0 }),
  })

  const { data: tracks = [], isLoading: loadingTr } = useQuery<TrackType[]>({
    queryKey: ['tracks'],
    queryFn: () => getTracks(),
  })

  const vehicles = vehiclesResp?.data ?? []

  // Client-side filtering
  const trackdays = React.useMemo(() => {
    let data = trackdaysRaw
    if (selectedVehicleId) data = data.filter((td) => td.userVehicleId === selectedVehicleId)
    if (selectedTrackId) data = data.filter((td) => td.trackId === selectedTrackId)
    if (startDate) {
      const s = new Date(startDate)
      s.setHours(0, 0, 0, 0)
      data = data.filter((td) => new Date(td.date) >= s)
    }
    if (endDate) {
      const e = new Date(endDate)
      e.setHours(23, 59, 59, 999)
      data = data.filter((td) => new Date(td.date) <= e)
    }
    return data
  }, [trackdaysRaw, selectedVehicleId, selectedTrackId, startDate, endDate])

  // ── KPI values ─────────────────────────────────────────────────────────────

  const kpiUniqueTrackIds = React.useMemo(
    () => new Set(trackdays.map((td) => td.trackId)).size,
    [trackdays]
  )
  const kpiTotalLaps = React.useMemo(
    () =>
      trackdays.reduce((sum, td) => {
        const laps = Number(td.totalLaps ?? 0)
        if (laps === 0 && td.chronos?.length) return sum + td.chronos.length
        return sum + laps
      }, 0),
    [trackdays]
  )
  const kpiTotalDistance = React.useMemo(
    () => Math.round(trackdays.reduce((sum, td) => sum + Number(td.totalDistance ?? 0), 0)),
    [trackdays]
  )
  const kpiTotalDrivingTime = React.useMemo(() => {
    const total = trackdays.reduce((sum, td) => {
      const validChronos = (td.chronos ?? []).filter((c) => CHRONO_RE.test(c.lapTime))
      if (validChronos.length > 0) {
        let chronoSum = validChronos.reduce((acc, c) => acc + lapToSeconds(c.lapTime), 0)
        if (
          td.bestLapTime &&
          CHRONO_RE.test(td.bestLapTime) &&
          !validChronos.some((c) => c.lapTime === td.bestLapTime)
        ) {
          chronoSum += lapToSeconds(td.bestLapTime)
        }
        return sum + chronoSum
      }
      if (td.bestLapTime && CHRONO_RE.test(td.bestLapTime) && td.totalLaps) {
        return sum + lapToSeconds(td.bestLapTime) * td.totalLaps
      }
      return sum
    }, 0)
    return total > 0 ? formatTotalTime(total) : null
  }, [trackdays])

  // ── Tracks driven chart ────────────────────────────────────────────────────

  const tracksDrivenData = React.useMemo(() => {
    const counts: Record<number, number> = {}
    trackdays.forEach((td) => {
      if (td.trackId) counts[td.trackId] = (counts[td.trackId] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([id, count]) => ({
        name: tracks.find((tr) => tr.id === Number(id))?.name ?? `Track ${id}`,
        sessions: count,
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10)
  }, [trackdays, tracks])

  const tracksDrivenConfig = { sessions: { label: t('number_of_trackdays') } } satisfies ChartConfig

  // ── Chronos by track chart ─────────────────────────────────────────────────

  const { chronosByTrackData, chronoTrackKeys } = React.useMemo(() => {
    const sorted = [...trackdays].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const dateMap: Record<string, any> = {}
    const keysSet = new Set<string>()

    sorted.forEach((td) => {
      const validTimes = (td.chronos ?? [])
        .filter((c) => CHRONO_RE.test(c.lapTime))
        .map((c) => lapToSeconds(c.lapTime))

      let lapSec: number | null = null
      if (validTimes.length) {
        lapSec = validTimes.reduce((a, b) => a + b, 0) / validTimes.length
      } else if (td.bestLapTime && CHRONO_RE.test(td.bestLapTime)) {
        lapSec = lapToSeconds(td.bestLapTime)
      }

      if (lapSec !== null) {
        const key = format(new Date(td.date), 'dd MMM yy', { locale: getLocale() })
        if (!dateMap[key]) dateMap[key] = { date: key }
        const trackName = tracks.find((tr) => tr.id === td.trackId)?.name ?? `Track ${td.trackId}`
        dateMap[key][trackName] = lapSec
        keysSet.add(trackName)
      }
    })

    return {
      chronosByTrackData: Object.values(dateMap),
      chronoTrackKeys: Array.from(keysSet),
    }
  }, [trackdays, tracks, i18n.language])

  // ── Monthly activity chart ─────────────────────────────────────────────────

  const monthlyData = React.useMemo(() => {
    const map: Record<string, { month: string; sessions: number; laps: number; distance: number }> =
      {}
    trackdays.forEach((td) => {
      const mKey = format(new Date(td.date), 'yyyy-MM')
      const mLabel = format(new Date(td.date), 'MMM yy', { locale: getLocale() })
      if (!map[mKey]) map[mKey] = { month: mLabel, sessions: 0, laps: 0, distance: 0 }
      map[mKey].sessions += 1
      map[mKey].laps += Number(td.totalLaps ?? 0)
      map[mKey].distance += Number(td.totalDistance ?? 0)
    })
    return Object.keys(map)
      .sort()
      .map((k) => map[k])
  }, [trackdays, i18n.language])

  const monthlyConfig = {
    sessions: { label: t('number_of_trackdays'), color: CHART_COLORS[0] },
    laps: { label: t('total_laps'), color: CHART_COLORS[1] },
  } satisfies ChartConfig

  // ── Options ────────────────────────────────────────────────────────────────

  const vehicleOptions = React.useMemo(
    () =>
      vehicles.map((v) => ({
        value: v.id.toString(),
        label: `${v.brand} ${v.model ?? ''}`.trim(),
      })),
    [vehicles]
  )

  const trackOptions = React.useMemo(
    () => [
      { value: 'all', label: t('all_tracks') },
      ...(tracks?.map((tr) => ({ value: tr.id.toString(), label: tr.name })) ?? []),
    ],
    [tracks, t]
  )

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loadingTD || loadingV || loadingTr) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t('loading')}…
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 pb-8">
      {/* ── Header + filter bar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {t('analytics')}{' '}
            {hasFilters && (
              <Badge variant="secondary" className="ml-2 ">
                {t('filters_active')}
              </Badge>
            )}
          </h1>
        </div>
        <div className="grid grid-cols-5 items-center gap-2">
          <Select
            value={selectedVehicleId?.toString() ?? 'all'}
            onValueChange={(v) => setSelectedVehicleId(v === 'all' ? undefined : Number(v))}
          >
            <SelectTrigger className=" ">
              <SelectValue placeholder={t('all_vehicles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_vehicles')}</SelectItem>
              {vehicleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Combobox
            options={trackOptions}
            value={selectedTrackId?.toString() ?? 'all'}
            onValueChange={(v) => setSelectedTrackId(v === 'all' ? undefined : Number(v))}
            placeholder={t('all_tracks')}
            emptyMessage={t('no_track_found')}
            className="truncate"
          />

          <DatePicker value={startDate} onChange={setStartDate} placeholder={t('start_date')} />
          <DatePicker value={endDate} onChange={setEndDate} placeholder={t('end_date')} />

          <Button disabled={!hasFilters} onClick={resetFilters}>
            <X />
            {t('clear_filters')}
          </Button>
        </div>
      </div>

      {/* ── KPI tiles ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title={t('number_of_trackdays')} value={trackdays.length} icon={Flag} />
        <KpiCard title={t('tracks_driven')} value={kpiUniqueTrackIds} icon={Map} />
        <KpiCard
          title={t('total_laps')}
          value={kpiTotalLaps.toLocaleString(i18n.language)}
          icon={GaugeCircle}
        />
        <KpiCard
          title={t('total_distance_km')}
          value={`${kpiTotalDistance.toLocaleString(i18n.language)} km`}
          icon={Route}
        />
        <KpiCard
          title={t('total_driving_time')}
          value={kpiTotalDrivingTime ?? '—'}
          icon={Clock}
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className="grid gap-6">
        {/* Tracks driven */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('tracks_driven')}</CardTitle>
            <CardDescription>
              {t('number_of_trackdays')} {t('by_track')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tracksDrivenData.length > 0 ? (
              <ChartContainer config={tracksDrivenConfig} className="h-[280px] w-full">
                <BarChart
                  data={tracksDrivenData}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-3 py-2  shadow-xl">
                          <p className="font-medium mb-1">{label}</p>
                          <p className="text-muted-foreground">
                            {t('number_of_trackdays')}:{' '}
                            <span className="font-semibold text-foreground">
                              {payload[0].value}
                            </span>
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                    {tracksDrivenData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        {/* Chronos by track */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('chronos_by_track')}</CardTitle>
            <CardDescription>
              {t('average_laptime')} {t('over_time')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chronosByTrackData.length > 0 ? (
              <ChartContainer
                config={Object.fromEntries(
                  chronoTrackKeys.map((k, i) => [
                    k,
                    { label: k, color: CHART_COLORS[i % CHART_COLORS.length] },
                  ])
                )}
                className="h-[280px] w-full"
              >
                <LineChart
                  data={chronosByTrackData}
                  margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(v) => {
                      const min = Math.floor(v / 60)
                      const sec = Math.floor(v % 60)
                      return `${min}:${String(sec).padStart(2, '0')}`
                    }}
                    width={40}
                  />
                  <ChartTooltip content={<LapTimeTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {chronoTrackKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            ) : (
              <EmptyChart icon={Timer} />
            )}
          </CardContent>
        </Card>

        {/* Monthly activity */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('monthly_activity')}</CardTitle>
            <CardDescription>{t('sessions_and_laps_per_month')}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ChartContainer config={monthlyConfig} className="h-[280px] w-full">
                <BarChart data={monthlyData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} width={36} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="rounded-lg border border-border/50 bg-background px-3 py-2  shadow-xl">
                          <p className="font-medium mb-1.5">{label}</p>
                          {payload.map((p: any) => (
                            <div key={p.dataKey} className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-sm shrink-0"
                                style={{ background: p.fill }}
                              />
                              <span className="text-muted-foreground">{p.name}</span>
                              <span className="font-semibold text-foreground ml-auto pl-4">
                                {p.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="sessions"
                    name={t('number_of_trackdays')}
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="laps"
                    name={t('total_laps')}
                    fill={CHART_COLORS[1]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart icon={TrendingDown} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyChart: React.FC<{ icon?: React.ElementType }> = ({ icon: Icon = Flag }) => {
  const { t } = useTranslation()
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-muted-foreground">
      <Icon className="h-8 w-8 opacity-30" />
      <p className="">{t('no_data_for_chart')}</p>
    </div>
  )
}

export default Analytics
