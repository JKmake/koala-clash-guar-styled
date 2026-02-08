import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { cn } from '@renderer/lib/utils'
import { mihomoUnfixedProxy } from '@renderer/utils/ipc'
import React, { useMemo, useState } from 'react'
import { FaMapPin } from 'react-icons/fa6'
import { useTranslation } from 'react-i18next'

interface Props {
  mutateProxies: () => void
  onProxyDelay: (proxy: string, url?: string) => Promise<ControllerProxiesDelay>
  proxyDisplayLayout: 'hidden' | 'single' | 'double'
  proxy: ControllerProxiesDetail | ControllerGroupDetail
  group: ControllerMixedGroup
  onSelect: (group: string, proxy: string) => void
  selected: boolean
}

const ProxyItem: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { mutateProxies, proxyDisplayLayout, group, proxy, selected, onSelect, onProxyDelay } =
    props

  const delay = useMemo(() => {
    if (proxy.history.length > 0) {
      return proxy.history[proxy.history.length - 1].delay
    }
    return -1
  }, [proxy])

  const [loading, setLoading] = useState(false)
  function delayColor(delay: number): string {
    if (delay === -1) return 'text-primary'
    if (delay === 0) return 'text-destructive'
    if (delay < 500) return 'text-success'
    return 'text-warning'
  }

  function delayText(delay: number): string {
    if (delay === -1) return t('proxies.delayTest')
    if (delay === 0) return t('proxies.timeout')
    return delay.toString()
  }

  const onDelay = (): void => {
    setLoading(true)
    onProxyDelay(proxy.name, group.testUrl).finally(() => {
      mutateProxies()
      setLoading(false)
    })
  }

  const fixed = group.fixed && group.fixed === proxy.name

  return (
    <Card
      onClick={() => onSelect(group.name, proxy.name)}
      className={cn(
        'w-full gap-0 py-0 cursor-pointer transition-colors',
        fixed
          ? 'bg-secondary/20 hover:bg-secondary/30 border-secondary/30'
          : selected
            ? 'bg-primary/10 hover:bg-primary/15 border-primary/30'
            : 'hover:bg-accent/50'
      )}
    >
      <CardContent className="px-3 py-2">
        <div
          className={`flex ${proxyDisplayLayout === 'double' ? 'gap-1' : 'justify-between items-center'}`}
        >
          {proxyDisplayLayout === 'double' ? (
            <>
              <div className="flex flex-col gap-0 flex-1 min-w-0">
                <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                  <div className="flag-emoji inline" title={proxy.name}>
                    {proxy.name}
                  </div>
                </div>
                <div className="text-[12px] text-muted-foreground leading-none mt-0.5">
                  <span>{proxy.type}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-0.5 shrink-0">
                {fixed && (
                  <Button
                    variant="ghost"
                    title={t('proxies.unpin')}
                    onClick={async (e) => {
                      e.stopPropagation()
                      await mihomoUnfixedProxy(group.name)
                      mutateProxies()
                    }}
                    className="h-6 w-6 min-w-6 p-0 text-xs text-destructive"
                  >
                    <FaMapPin className="text-xs" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  title={proxy.type}
                  disabled={loading}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelay()
                  }}
                  className={cn('h-8 w-8 min-w-8 p-0 text-xs', delayColor(delay))}
                >
                  {delayText(delay)}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                <div className="flag-emoji inline" title={proxy.name}>
                  {proxy.name}
                </div>
                {proxyDisplayLayout === 'single' && (
                  <div className="inline ml-2 text-muted-foreground" title={proxy.type}>
                    {proxy.type}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {fixed && (
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      title={t('proxies.unpin')}
                      onClick={async (e) => {
                        e.stopPropagation()
                        await mihomoUnfixedProxy(group.name)
                        mutateProxies()
                      }}
                      className="h-6 w-6 min-w-6 p-0 text-xs text-destructive"
                    >
                      <FaMapPin className="text-xs" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    title={proxy.type}
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelay()
                    }}
                    className={cn(
                      'h-full w-8 min-w-8 p-0 text-sm',
                      delayColor(delay)
                    )}
                  >
                    {delayText(delay)}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProxyItem
