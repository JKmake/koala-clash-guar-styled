import React from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { restartCore, triggerSysProxy } from '@renderer/utils/ipc'
import { useNavigate } from 'react-router-dom'
import { IoSettings } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'

const ProxySwitches: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const { tun } = controledMihomoConfig || {}
  const { appConfig, patchAppConfig } = useAppConfig()
  const { sysProxy, onlyActiveDevice = false, mainSwitchMode = 'tun' } = appConfig || {}
  const { enable: sysProxyEnable, mode } = sysProxy || {}
  const { 'mixed-port': mixedPort } = controledMihomoConfig || {}
  const sysProxyDisabled = mixedPort == 0

  return (
    <SettingCard>
      <SettingItem title={t('settings.advanced.mainSwitch')} divider>
        <Tabs
          value={mainSwitchMode}
          onValueChange={(value) => {
            patchAppConfig({ mainSwitchMode: value as 'tun' | 'sysproxy' })
          }}
        >
          <TabsList className="h-8">
            <TabsTrigger value="tun">{t('settings.advanced.mainSwitchTun')}</TabsTrigger>
            <TabsTrigger value="sysproxy">{t('settings.advanced.mainSwitchSysproxy')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </SettingItem>
      <SettingItem
        title={t('sider.virtualInterface')}
        actions={
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => navigate('/tun')}
          >
            <IoSettings className="text-lg" />
          </Button>
        }
        divider
      >
        <Switch
          size="sm"
          checked={tun?.enable}
          onCheckedChange={async (enable: boolean) => {
            if (enable) {
              await patchControledMihomoConfig({ tun: { enable }, dns: { enable: true } })
            } else {
              await patchControledMihomoConfig({ tun: { enable } })
            }
            await restartCore()
            window.electron.ipcRenderer.send('updateFloatingWindow')
            window.electron.ipcRenderer.send('updateTrayMenu')
          }}
        />
      </SettingItem>
      <SettingItem
        title={t('sider.systemProxy')}
        actions={
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => navigate('/sysproxy')}
          >
            <IoSettings className="text-lg" />
          </Button>
        }
      >
        <Switch
          size="sm"
          checked={sysProxyEnable}
          disabled={mode == 'manual' && sysProxyDisabled}
          onCheckedChange={async (enable: boolean) => {
            if (mode == 'manual' && sysProxyDisabled) return
            try {
              await triggerSysProxy(enable, onlyActiveDevice)
              await patchAppConfig({ sysProxy: { enable } })
              window.electron.ipcRenderer.send('updateFloatingWindow')
              window.electron.ipcRenderer.send('updateTrayMenu')
            } catch (e) {
              alert(e)
            }
          }}
        />
      </SettingItem>
    </SettingCard>
  )
}

export default ProxySwitches
