import BasePage from '@renderer/components/base/base-page'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { useProfileConfig } from '@renderer/hooks/use-profile-config'
import { useGroups } from '@renderer/hooks/use-groups'
import { restartCore, triggerSysProxy } from '@renderer/utils/ipc'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { IoPause, IoPower } from 'react-icons/io5'

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const Home: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()
  const {
    mainSwitchMode = 'tun',
    sysProxy,
    onlyActiveDevice = false,
  } = appConfig || {}
  const { enable: sysProxyEnable, mode } = sysProxy || {}
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { tun } = controledMihomoConfig || {}
  const { 'mixed-port': mixedPort } = controledMihomoConfig || {}
  const sysProxyDisabled = mixedPort == 0

  const { profileConfig } = useProfileConfig()
  const { groups } = useGroups()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [loadingDirection, setLoadingDirection] = useState<'connecting' | 'disconnecting'>(
    'connecting'
  )

  // Connection timer
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isSelected =
    mainSwitchMode === 'tun' ? (tun?.enable ?? false) : (sysProxyEnable ?? false)

  useEffect(() => {
    if (isSelected) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      setElapsed(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isSelected])

  const isDisabled =
    loading || (mainSwitchMode === 'sysproxy' && mode == 'manual' && sysProxyDisabled)

  const status = loading
    ? loadingDirection === 'connecting'
      ? t('pages.home.connecting')
      : t('pages.home.disconnecting')
    : isSelected
      ? t('pages.home.connected')
      : t('pages.home.disconnected')

  const statusColor = loading
    ? 'text-warning'
    : isSelected
      ? 'text-success'
      : 'text-muted-foreground'

  // Current profile & subscription
  const currentProfile = useMemo(() => {
    if (!profileConfig?.current || !profileConfig?.items) return null
    return profileConfig.items.find((item) => item.id === profileConfig.current) ?? null
  }, [profileConfig])

  const subscription = currentProfile?.extra
  const trafficUsed = (subscription?.upload ?? 0) + (subscription?.download ?? 0)
  const trafficTotal = subscription?.total ?? 0
  const trafficRemaining = trafficTotal > 0 ? trafficTotal - trafficUsed : 0
  const expireTimestamp = subscription?.expire ?? 0
  const expireDate = expireTimestamp > 0 ? dayjs.unix(expireTimestamp).format('DD.MM.YYYY') : '—'
  const daysRemaining =
    expireTimestamp > 0 ? Math.max(0, dayjs.unix(expireTimestamp).diff(dayjs(), 'day')) : 0

  const firstGroup = groups?.[0]

  const onValueChange = async (enable: boolean): Promise<void> => {
    setLoading(true)
    setLoadingDirection(enable ? 'connecting' : 'disconnecting')
    try {
      if (mainSwitchMode === 'tun') {
        if (enable) {
          await patchControledMihomoConfig({ tun: { enable }, dns: { enable: true } })
        } else {
          await patchControledMihomoConfig({ tun: { enable } })
        }
        await restartCore()
        window.electron.ipcRenderer.send('updateFloatingWindow')
        window.electron.ipcRenderer.send('updateTrayMenu')
      } else {
        if (mode == 'manual' && sysProxyDisabled) return
        await triggerSysProxy(enable, onlyActiveDevice)
        await patchAppConfig({ sysProxy: { enable } })
        window.electron.ipcRenderer.send('updateFloatingWindow')
        window.electron.ipcRenderer.send('updateTrayMenu')
      }
    } catch (e) {
      alert(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasePage>
      <div className="flex flex-col h-full px-2 pb-2 gap-4">
        {/* Profile card */}
        {currentProfile && (
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {currentProfile.home && (
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(currentProfile.home).hostname}&sz=32`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              <span className="font-semibold text-lg">{currentProfile.name}</span>
            </div>
            <div className="text-sm text-center">
              Эвкалипт 🌿— вечнозелёное дерево с ароматными листьями. Его масло применяют
              при простуде, а листья используют в чаях и ингаляциях. 🌱 Полезен, красив и незаменим.
              Ведь природа знает толк в пользе! 🍃
            </div>
            {/* Subscription info */}
          </div>
        )}
        {subscription && (
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card/50 backdrop-blur p-1 bg-background/50">
            <div className="flex flex-col items-center py-2 px-1">
              <span className="text-xs text-muted-foreground">
                {t('pages.home.trafficRemaining')}
              </span>
              <span className="font-bold text-sm mt-0.5">
                {trafficTotal > 0 ? formatBytes(trafficRemaining) : t('pages.home.unlimited')}
              </span>
            </div>
            <div className="flex flex-col items-center py-2 px-1">
              <span className="text-xs text-muted-foreground">{t('pages.home.daysRemaining')}</span>
              <span className="font-bold text-sm mt-0.5">
                {expireTimestamp > 0 ? daysRemaining : '∞'}
              </span>
            </div>
            <div className="flex flex-col items-center py-2 px-1">
              <span className="text-xs text-muted-foreground">{t('pages.home.expires')}</span>
              <span className="font-bold text-sm mt-0.5">{expireDate}</span>
            </div>
          </div>
        )}

        {/* Connection button */}
        <div className="flex-1 flex flex-col grow-3 items-center justify-center gap-3 min-h-0">
          <span className={`text-lg font-semibold uppercase tracking-wider ${statusColor}`}>
            {status}
          </span>
          <button
            disabled={isDisabled}
            onClick={() => onValueChange(!isSelected)}
            className="relative group transition-transform active:scale-95 disabled:opacity-50"
          >
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSelected
                  ? 'bg-success text-success-foreground shadow-[0_0_40px_rgba(34,197,94,0.3)]'
                  : 'bg-muted text-muted-foreground'
              } ${loading ? 'animate-pulse' : ''}`}
            >
              {isSelected ? <IoPause className="w-16 h-16" /> : <IoPower className="w-16 h-16" />}
            </div>
          </button>
          <span className="text-lg font-mono tabular-nums text-foreground/80">
            {formatTimer(elapsed)}
          </span>
        </div>

        {/* Group & Proxy selectors */}
        {firstGroup && (
          <div className="flex flex-col grow items-center gap-3 pb-2 mx-auto w-full max-w-48">
            <div
              className="w-full cursor-pointer"
              onClick={() => navigate('/proxies')}
            >
              <div className="flex items-center h-9 rounded-xl border border-input px-3 py-1 backdrop-blur-xl bg-background/60 text-sm">
                {firstGroup.now || '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </BasePage>
  )
}

export default Home
