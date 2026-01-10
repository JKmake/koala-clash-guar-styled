import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs
} from '@heroui/react'
import React, { useState, useEffect } from 'react'
import SettingItem from '../base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import debounce from '@renderer/utils/debounce'
import { t } from 'i18next'

interface Props {
  onClose: () => void
}

const ProxySettingModal: React.FC<Props> = (props) => {
  const { onClose } = props
  const { appConfig, patchAppConfig } = useAppConfig()

  const {
    proxyCols = 'auto',
    proxyDisplayOrder = 'default',
    groupDisplayLayout = 'single',
    proxyDisplayLayout = 'double',
    autoCloseConnection = true,
    delayTestUrl,
    delayTestConcurrency,
    delayTestTimeout
  } = appConfig || {}

  const [url, setUrl] = useState(delayTestUrl ?? '')

  const setUrlDebounce = debounce((v: string) => {
    patchAppConfig({ delayTestUrl: v })
  }, 500)

  useEffect(() => {
    setUrl(delayTestUrl ?? '')
  }, [delayTestUrl])

  return (
    <Modal
      backdrop="blur"
      classNames={{ backdrop: 'top-[48px]' }}
      size="xl"
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent className="flag-emoji">
        <ModalHeader className="flex pb-0">{t('pages.proxies.proxyGroupSettings')}</ModalHeader>
        <ModalBody className="py-2 gap-1">
          <SettingItem title={t('proxies.proxyNodeColumns')} divider>
            <Select
              classNames={{ trigger: 'data-[hover=true]:bg-default-200' }}
              className="w-[150px]"
              size="sm"
              selectedKeys={new Set([proxyCols])}
              disallowEmptySelection={true}
              onSelectionChange={async (v) => {
                await patchAppConfig({ proxyCols: v.currentKey as 'auto' | '1' | '2' | '3' | '4' })
              }}
            >
              <SelectItem key="auto">{t('proxies.proxyColsAuto')}</SelectItem>
              <SelectItem key="1">{t('proxies.proxyCols1')}</SelectItem>
              <SelectItem key="2">{t('proxies.proxyCols2')}</SelectItem>
              <SelectItem key="3">{t('proxies.proxyCols3')}</SelectItem>
              <SelectItem key="4">{t('proxies.proxyCols4')}</SelectItem>
            </Select>
          </SettingItem>
          <SettingItem title={t('proxies.nodeSortMethod')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={proxyDisplayOrder}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  proxyDisplayOrder: v as 'default' | 'delay' | 'name'
                })
              }}
            >
              <Tab key="default" title={t('proxies.sortDefault')} />
              <Tab key="delay" title={t('proxies.sortDelay')} />
              <Tab key="name" title={t('proxies.sortName')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('proxies.proxyGroupDetails')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={groupDisplayLayout}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  groupDisplayLayout: v as 'hidden' | 'single' | 'double'
                })
              }}
            >
              <Tab key="hidden" title={t('proxies.displayHidden')} />
              <Tab key="single" title={t('proxies.displaySingle')} />
              <Tab key="double" title={t('proxies.displayDouble')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('proxies.proxyNodeDetails')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={proxyDisplayLayout}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  proxyDisplayLayout: v as 'hidden' | 'single' | 'double'
                })
              }}
            >
              <Tab key="hidden" title={t('proxies.displayHidden')} />
              <Tab key="single" title={t('proxies.displaySingle')} />
              <Tab key="double" title={t('proxies.displayDouble')} />
            </Tabs>
          </SettingItem>
          <SettingItem title={t('proxies.disconnectOnSwitch')} divider>
            <Switch
              size="sm"
              isSelected={autoCloseConnection}
              onValueChange={(v) => {
                patchAppConfig({ autoCloseConnection: v })
              }}
            />
          </SettingItem>
          <SettingItem title={t('proxies.delayTestUrl')} divider>
            <Input
              size="sm"
              className="w-[60%]"
              value={url}
              placeholder={t('proxies.delayTestUrlPlaceholder')}
              onValueChange={(v) => {
                setUrl(v)
                setUrlDebounce(v)
              }}
            />
          </SettingItem>
          <SettingItem title={t('proxies.delayTestConcurrency')} divider>
            <Input
              type="number"
              size="sm"
              className="w-[100px]"
              value={delayTestConcurrency?.toString()}
              placeholder={t('proxies.delayTestConcurrencyPlaceholder')}
              onValueChange={(v) => {
                patchAppConfig({ delayTestConcurrency: parseInt(v) })
              }}
            />
          </SettingItem>
          <SettingItem title={t('proxies.delayTestTimeout')}>
            <Input
              type="number"
              size="sm"
              className="w-[100px]"
              value={delayTestTimeout?.toString()}
              placeholder={t('proxies.delayTestTimeoutPlaceholder')}
              onValueChange={(v) => {
                patchAppConfig({ delayTestTimeout: parseInt(v) })
              }}
            />
          </SettingItem>
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="light" onPress={onClose}>
            {t('common.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProxySettingModal
