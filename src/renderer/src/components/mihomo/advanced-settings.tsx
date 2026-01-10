import { useControledMihomoConfig } from '@renderer/hooks/use-controled-mihomo-config'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import InterfaceSelect from '../base/interface-select'
import { restartCore } from '@renderer/utils/ipc'
import { Button, Input, Select, SelectItem, Switch, Tab, Tabs, Tooltip } from '@heroui/react'
import { useState } from 'react'
import { IoIosHelpCircle } from 'react-icons/io'
import { t } from 'i18next'

const AdvancedSetting: React.FC = () => {
  const { controledMihomoConfig, patchControledMihomoConfig } = useControledMihomoConfig()
  const {
    'unified-delay': unifiedDelay,
    'tcp-concurrent': tcpConcurrent,
    'disable-keep-alive': disableKeepAlive = false,
    'find-process-mode': findProcessMode = 'always',
    'interface-name': interfaceName = '',
    'global-client-fingerprint': globalClientFingerprint = '',
    'keep-alive-idle': idle = 15,
    'keep-alive-interval': interval = 15,
    profile = {},
    tun = {}
  } = controledMihomoConfig || {}
  const { 'store-selected': storeSelected, 'store-fake-ip': storeFakeIp } = profile
  const { device = 'mihomo' } = tun

  const [idleInput, setIdleInput] = useState(idle)
  const [intervalInput, setIntervalInput] = useState(interval)

  const onChangeNeedRestart = async (patch: Partial<MihomoConfig>): Promise<void> => {
    await patchControledMihomoConfig(patch)
    await restartCore()
  }

  return (
    <SettingCard title={t('mihomo.advancedSettings.title')}>
      <SettingItem title={t('mihomo.advancedSettings.findProcess')} divider>
        <Tabs
          size="sm"
          color="primary"
          selectedKey={findProcessMode}
          onSelectionChange={(key) => {
            onChangeNeedRestart({ 'find-process-mode': key as FindProcessMode })
          }}
        >
          <Tab key="strict" title={t('mihomo.advancedSettings.auto')}></Tab>
          <Tab key="off" title={t('common.close')}></Tab>
          <Tab key="always" title={t('mihomo.advancedSettings.enable')}></Tab>
        </Tabs>
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.storeSelected')} divider>
        <Switch
          size="sm"
          isSelected={storeSelected}
          onValueChange={(v) => {
            onChangeNeedRestart({ profile: { 'store-selected': v } })
          }}
        />
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.storeFakeIP')} divider>
        <Switch
          size="sm"
          isSelected={storeFakeIp}
          onValueChange={(v) => {
            onChangeNeedRestart({ profile: { 'store-fake-ip': v } })
          }}
        />
      </SettingItem>
      <SettingItem
        title={t('mihomo.advancedSettings.unifiedDelay')}
        actions={
          <Tooltip content={t('mihomo.advancedSettings.unifiedDelayTip')}>
            <Button isIconOnly size="sm" variant="light">
              <IoIosHelpCircle className="text-lg" />
            </Button>
          </Tooltip>
        }
        divider
      >
        <Switch
          size="sm"
          isSelected={unifiedDelay}
          onValueChange={(v) => {
            onChangeNeedRestart({ 'unified-delay': v })
          }}
        />
      </SettingItem>
      <SettingItem
        title={t('mihomo.advancedSettings.tcpConcurrent')}
        actions={
          <Tooltip content={t('mihomo.advancedSettings.tcpConcurrentTip')}>
            <Button isIconOnly size="sm" variant="light">
              <IoIosHelpCircle className="text-lg" />
            </Button>
          </Tooltip>
        }
        divider
      >
        <Switch
          size="sm"
          isSelected={tcpConcurrent}
          onValueChange={(v) => {
            onChangeNeedRestart({ 'tcp-concurrent': v })
          }}
        />
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.disableTCPKeepAlive')} divider>
        <Switch
          size="sm"
          isSelected={disableKeepAlive}
          onValueChange={(v) => {
            onChangeNeedRestart({ 'disable-keep-alive': v })
          }}
        />
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.tcpKeepAliveInterval')} divider>
        <div className="flex">
          {intervalInput !== interval && (
            <Button
              size="sm"
              color="primary"
              className="mr-2"
              onPress={async () => {
                await onChangeNeedRestart({ 'keep-alive-interval': intervalInput })
              }}
            >
              {t('common.confirm')}
            </Button>
          )}
          <Input
            size="sm"
            type="number"
            className="w-[100px]"
            value={intervalInput.toString()}
            min={0}
            onValueChange={(v) => {
              setIntervalInput(parseInt(v) || 0)
            }}
          />
        </div>
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.tcpKeepAliveIdle')} divider>
        <div className="flex">
          {idleInput !== idle && (
            <Button
              size="sm"
              color="primary"
              className="mr-2"
              onPress={async () => {
                await onChangeNeedRestart({ 'keep-alive-idle': idleInput })
              }}
            >
              {t('common.confirm')}
            </Button>
          )}
          <Input
            size="sm"
            type="number"
            className="w-[100px]"
            value={idleInput.toString()}
            min={0}
            onValueChange={(v) => {
              setIdleInput(parseInt(v) || 0)
            }}
          />
        </div>
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.utlsFingerprint')} divider>
        <Select
          size="sm"
          className="w-[150px]"
          selectedKeys={new Set([globalClientFingerprint])}
          disallowEmptySelection={true}
          onSelectionChange={(v) => {
            onChangeNeedRestart({ 'global-client-fingerprint': v.currentKey as Fingerprints })
          }}
        >
          <SelectItem key="">{t('mihomo.advancedSettings.disabled')}</SelectItem>
          <SelectItem key="random">{t('mihomo.advancedSettings.random')}</SelectItem>
          <SelectItem key="chrome">Chrome</SelectItem>
          <SelectItem key="firefox">Firefox</SelectItem>
          <SelectItem key="safari">Safari</SelectItem>
          <SelectItem key="ios">iOS</SelectItem>
          <SelectItem key="android">Android</SelectItem>
          <SelectItem key="edge">Edge</SelectItem>
          <SelectItem key="360">360</SelectItem>
          <SelectItem key="qq">QQ</SelectItem>
        </Select>
      </SettingItem>
      <SettingItem title={t('mihomo.advancedSettings.outboundInterface')}>
        <InterfaceSelect
          value={interfaceName}
          exclude={[device, 'lo']}
          onChange={(iface) => onChangeNeedRestart({ 'interface-name': iface })}
        />
      </SettingItem>
    </SettingCard>
  )
}

export default AdvancedSetting
