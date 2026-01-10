import React from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import { RadioGroup, Radio } from '@heroui/react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { useTranslation } from 'react-i18next'

const SiderConfig: React.FC = () => {
  const { t } = useTranslation()
  const { appConfig, patchAppConfig } = useAppConfig()

  const titleMap = {
    sysproxyCardStatus: t('settings.sider.sysproxyCardStatus'),
    tunCardStatus: t('settings.sider.tunCardStatus'),
    profileCardStatus: t('settings.sider.profileCardStatus'),
    proxyCardStatus: t('settings.sider.proxyCardStatus'),
    ruleCardStatus: t('settings.sider.ruleCardStatus'),
    resourceCardStatus: t('settings.sider.resourceCardStatus'),
    overrideCardStatus: t('settings.sider.overrideCardStatus'),
    connectionCardStatus: t('settings.sider.connectionCardStatus'),
    mihomoCoreCardStatus: t('settings.sider.mihomoCoreCardStatus'),
    dnsCardStatus: t('settings.sider.dnsCardStatus'),
    sniffCardStatus: t('settings.sider.sniffCardStatus'),
    logCardStatus: t('settings.sider.logCardStatus'),
    substoreCardStatus: t('settings.sider.substoreCardStatus')
  }
  const {
    sysproxyCardStatus = 'col-span-1',
    tunCardStatus = 'col-span-1',
    profileCardStatus = 'col-span-2',
    proxyCardStatus = 'col-span-2',
    ruleCardStatus = 'col-span-1',
    resourceCardStatus = 'col-span-1',
    overrideCardStatus = 'col-span-1',
    connectionCardStatus = 'col-span-2',
    mihomoCoreCardStatus = 'col-span-2',
    dnsCardStatus = 'col-span-1',
    sniffCardStatus = 'col-span-1',
    logCardStatus = 'col-span-1',
    substoreCardStatus = 'col-span-1'
  } = appConfig || {}

  const cardStatus = {
    sysproxyCardStatus,
    tunCardStatus,
    profileCardStatus,
    proxyCardStatus,
    ruleCardStatus,
    resourceCardStatus,
    overrideCardStatus,
    connectionCardStatus,
    mihomoCoreCardStatus,
    dnsCardStatus,
    sniffCardStatus,
    logCardStatus,
    substoreCardStatus
  }

  return (
    <SettingCard title={t('settings.sider.siderSettings')}>
      {Object.keys(cardStatus).map((key, index, array) => {
        return (
          <SettingItem title={titleMap[key]} key={key} divider={index !== array.length - 1}>
            <RadioGroup
              orientation="horizontal"
              value={cardStatus[key]}
              onValueChange={(v) => {
                patchAppConfig({ [key]: v as CardStatus })
              }}
            >
              <Radio value="col-span-2">{t('settings.sider.large')}</Radio>
              <Radio value="col-span-1">{t('settings.sider.small')}</Radio>
              <Radio value="hidden">{t('settings.sider.hidden')}</Radio>
            </RadioGroup>
          </SettingItem>
        )
      })}
    </SettingCard>
  )
}

export default SiderConfig
