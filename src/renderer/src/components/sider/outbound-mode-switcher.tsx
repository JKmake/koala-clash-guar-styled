/* eslint-disable react/prop-types */
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { useGroups } from '@renderer/hooks/use-groups'
import { mihomoCloseAllConnections, patchMihomoConfig } from '@renderer/utils/ipc'
import { useTranslation } from 'react-i18next'

interface Props {
  iconOnly?: boolean
}

const OutboundModeSwitcher: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { iconOnly } = props
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { mutate: mutateGroups } = useGroups()
  const { appConfig } = useAppConfig()
  const { autoCloseConnection = true } = appConfig || {}
  const { mode } = controledMihomoConfig || {}

  const onChangeMode = async (mode: OutboundMode): Promise<void> => {
    await patchControledMihomoConfig({ mode })
    await patchMihomoConfig({ mode })
    if (autoCloseConnection) {
      await mihomoCloseAllConnections()
    }
    mutateGroups()
    window.electron.ipcRenderer.send('updateTrayMenu')
  }
  if (!mode) return null
  if (iconOnly) {
    return (
      <Tabs
        orientation="vertical"
        value={mode}
        onValueChange={(value) => onChangeMode(value as OutboundMode)}
      >
        <TabsList className="bg-card shadow-md outbound-mode-card flex-col">
          <TabsTrigger value="rule" className={mode === 'rule' ? 'font-bold' : ''}>
            R
          </TabsTrigger>
          <TabsTrigger value="global" className={mode === 'global' ? 'font-bold' : ''}>
            G
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )
  }
  return (
    <Tabs value={mode} onValueChange={(value) => onChangeMode(value as OutboundMode)}>
      <TabsList className="bg-card shadow-md outbound-mode-card w-full">
        <TabsTrigger value="rule" className={mode === 'rule' ? 'font-bold' : ''}>
          {t('sider.rules')}
        </TabsTrigger>
        <TabsTrigger value="global" className={mode === 'global' ? 'font-bold' : ''}>
          {t('common.global')}
        </TabsTrigger>
        <TabsTrigger value="direct" className={mode === 'direct' ? 'font-bold' : ''}>
          {t('sider.directMode')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export default OutboundModeSwitcher
