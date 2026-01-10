import { Button, Input, Switch, Tab, Tabs, Tooltip } from '@heroui/react'
import BasePage from '@renderer/components/base/base-page'
import SettingCard from '@renderer/components/base/base-setting-card'
import SettingItem from '@renderer/components/base/base-setting-item'
import EditableList from '@renderer/components/base/base-list-editor'
import PacEditorModal from '@renderer/components/sysproxy/pac-editor-modal'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { platform } from '@renderer/utils/init'
import { openUWPTool, triggerSysProxy } from '@renderer/utils/ipc'
import React, { Key, useEffect, useState } from 'react'
import ByPassEditorModal from '@renderer/components/sysproxy/bypass-editor-modal'
import { IoIosHelpCircle } from 'react-icons/io'
import { useTranslation } from 'react-i18next'
import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'

const defaultPacScript = `
function FindProxyForURL(url, host) {
  return "PROXY 127.0.0.1:%mixed-port%; SOCKS5 127.0.0.1:%mixed-port%; DIRECT;";
}
`

const Sysproxy: React.FC = () => {
  const { t } = useTranslation()
  const defaultBypass: string[] =
    platform === 'linux'
      ? [
          'localhost',
          '.local',
          '127.0.0.1/8',
          '192.168.0.0/16',
          '10.0.0.0/8',
          '172.16.0.0/12',
          '::1'
        ]
      : platform === 'darwin'
        ? [
            '127.0.0.1/8',
            '192.168.0.0/16',
            '10.0.0.0/8',
            '172.16.0.0/12',
            'localhost',
            '*.local',
            '*.crashlytics.com',
            '<local>'
          ]
        : [
            'localhost',
            '127.*',
            '192.168.*',
            '10.*',
            '172.16.*',
            '172.17.*',
            '172.18.*',
            '172.19.*',
            '172.20.*',
            '172.21.*',
            '172.22.*',
            '172.23.*',
            '172.24.*',
            '172.25.*',
            '172.26.*',
            '172.27.*',
            '172.28.*',
            '172.29.*',
            '172.30.*',
            '172.31.*',
            '<local>'
          ]

  const { appConfig, patchAppConfig } = useAppConfig()
  const { sysProxy, onlyActiveDevice = false } =
    appConfig || ({ sysProxy: { enable: false } } as AppConfig)
  const { mode } = sysProxy || {}
  const { controledMihomoConfig } = useControledMihomoConfig()
  const { 'mixed-port': mixedPort } = controledMihomoConfig || {}
  const disabled = mixedPort == 0
  const [changed, setChanged] = useState(false)
  const [values, originSetValues] = useState({
    enable: sysProxy.enable,
    host: sysProxy.host ?? '',
    bypass: sysProxy.bypass ?? defaultBypass,
    mode: sysProxy.mode ?? 'manual',
    pacScript: sysProxy.pacScript ?? defaultPacScript,
    settingMode: sysProxy.settingMode ?? 'exec'
  })
  useEffect(() => {
    originSetValues((prev) => ({
      ...prev,
      enable: sysProxy.enable
    }))
  }, [sysProxy.enable])
  const [openEditor, setOpenEditor] = useState(false)
  const [openPacEditor, setOpenPacEditor] = useState(false)

  const setValues = (v: typeof values): void => {
    originSetValues(v)
    setChanged(true)
  }
  const onSave = async (): Promise<void> => {
    // check valid TODO
    await patchAppConfig({ sysProxy: values })
    setChanged(false)
    if (values.enable) {
      try {
        await triggerSysProxy(values.enable, onlyActiveDevice)
      } catch (e) {
        alert(e)
        await patchAppConfig({ sysProxy: { enable: false } })
      }
    }
  }

  return (
    <BasePage
      title={t('pages.sysproxy.title')}
      header={
        changed && (
          <Button color="primary" className="app-nodrag" size="sm" onPress={onSave}>
            {t('common.save')}
          </Button>
        )
      }
    >
      {openPacEditor && (
        <PacEditorModal
          script={values.pacScript || defaultPacScript}
          onCancel={() => setOpenPacEditor(false)}
          onConfirm={(script: string) => {
            setValues({ ...values, pacScript: script })
            setOpenPacEditor(false)
          }}
        />
      )}
      {openEditor && (
        <ByPassEditorModal
          bypass={values.bypass}
          onCancel={() => setOpenEditor(false)}
          onConfirm={async (list: string[]) => {
            setOpenEditor(false)
            setValues({
              ...values,
              bypass: list
            })
          }}
        />
      )}
      <SettingCard>
        <SettingItem title={t('sider.systemProxy')}>
          <Switch
            size="sm"
            isDisabled={mode == 'manual' && disabled}
            onValueChange={async (enable: boolean): Promise<void> => {
              if (mode == 'manual' && disabled) return
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
      <SettingCard className="sysproxy-settings">
        <SettingItem title={t('pages.sysproxy.proxyHost')} divider>
          <Input
            size="sm"
            className="w-[50%]"
            value={values.host}
            placeholder={t('pages.sysproxy.proxyHostPlaceholder')}
            onValueChange={(v) => {
              setValues({ ...values, host: v })
            }}
          />
        </SettingItem>
        <SettingItem title={t('pages.sysproxy.proxyMode')} divider>
          <Tabs
            size="sm"
            color="primary"
            selectedKey={values.mode}
            onSelectionChange={(key: Key) => setValues({ ...values, mode: key as SysProxyMode })}
          >
            <Tab key="manual" title={t('pages.sysproxy.manual')} />
            <Tab key="auto" title={t('pages.sysproxy.auto')} />
          </Tabs>
        </SettingItem>
        {platform === 'win32' && (
          <SettingItem title={t('pages.sysproxy.uwpTool')} divider>
            <Button
              size="sm"
              onPress={async () => {
                await openUWPTool()
              }}
            >
              {t('pages.sysproxy.openUWPTool')}
            </Button>
          </SettingItem>
        )}
        {platform == 'darwin' && (
          <>
            <SettingItem title={t('pages.sysproxy.settingMethod')} divider>
              <Tabs
                size="sm"
                color="primary"
                selectedKey={values.settingMode}
                onSelectionChange={(key) => {
                  setValues({ ...values, settingMode: key as 'exec' | 'service' })
                }}
              >
                <Tab key="exec" title={t('pages.sysproxy.execCommand')} />
                <Tab key="service" title={t('pages.sysproxy.serviceMode')} />
              </Tabs>
            </SettingItem>
            <SettingItem
              title={t('pages.sysproxy.onlyActiveInterface')}
              actions={
                <Tooltip
                  content={
                    <>
                      <div>{t('pages.sysproxy.onlyActiveInterfaceHelp')}</div>
                    </>
                  }
                >
                  <Button isIconOnly size="sm" variant="light">
                    <IoIosHelpCircle className="text-lg" />
                  </Button>
                </Tooltip>
              }
              divider
            >
              <Switch
                size="sm"
                isSelected={onlyActiveDevice}
                isDisabled={!values.settingMode || values.settingMode !== 'service'}
                onValueChange={(v) => {
                  patchAppConfig({ onlyActiveDevice: v })
                }}
              />
            </SettingItem>
          </>
        )}
        {values.mode === 'auto' && (
          <SettingItem title={t('pages.sysproxy.proxyMode')}>
            <Button size="sm" onPress={() => setOpenPacEditor(true)}>
              {t('pages.sysproxy.editPACScript')}
            </Button>
          </SettingItem>
        )}
        {values.mode === 'manual' && (
          <>
            <SettingItem title={t('pages.sysproxy.addDefaultBypass')} divider>
              <Button
                size="sm"
                onPress={() => {
                  setValues({
                    ...values,
                    bypass: Array.from(new Set([...defaultBypass, ...values.bypass]))
                  })
                }}
              >
                {t('pages.sysproxy.addDefaultBypass')}
              </Button>
            </SettingItem>
            <SettingItem title={t('pages.sysproxy.proxyBypassList')}>
              <Button
                size="sm"
                onPress={async () => {
                  setOpenEditor(true)
                }}
              >
                {t('common.edit')}
              </Button>
            </SettingItem>
            <EditableList
              items={values.bypass}
              onChange={(list) => setValues({ ...values, bypass: list as string[] })}
              placeholder={t('pages.sysproxy.exampleBypass')}
              divider={false}
            />
          </>
        )}
      </SettingCard>
    </BasePage>
  )
}

export default Sysproxy
