import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  Switch,
  ModalBody,
  Input
} from '@heroui/react'
import React from 'react'
import SettingItem from '../base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { restartMihomoConnections } from '@renderer/utils/ipc'
import { t } from 'i18next'

interface Props {
  onClose: () => void
}

const ConnectionSettingModal: React.FC<Props> = (props) => {
  const { onClose } = props
  const { appConfig, patchAppConfig } = useAppConfig()

  const { displayIcon = true, displayAppName = true, connectionInterval = 500 } = appConfig || {}

  return (
    <Modal
      backdrop="blur"
      classNames={{ backdrop: 'top-[48px]' }}
      size="md"
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent className="flag-emoji">
        <ModalHeader className="flex">{t('pages.connections.connectionSettings')}</ModalHeader>
        <ModalBody className="py-2 gap-1">
          <SettingItem title={t('connection.showAppIcon')} divider>
            <Switch
              size="sm"
              isSelected={displayIcon}
              onValueChange={(v) => {
                patchAppConfig({ displayIcon: v })
              }}
            />
          </SettingItem>
          <SettingItem title={t('connection.showAppName')} divider>
            <Switch
              size="sm"
              isSelected={displayAppName}
              onValueChange={(v) => {
                patchAppConfig({ displayAppName: v })
              }}
            />
          </SettingItem>
          <SettingItem title={t('connection.refreshInterval')}>
            <Input
              type="number"
              size="sm"
              className="w-[150px]"
              endContent={t('connection.refreshIntervalUnit')}
              value={connectionInterval?.toString()}
              placeholder={t('connection.refreshIntervalPlaceholder')}
              onValueChange={async (v) => {
                let num = parseInt(v)
                if (isNaN(num)) num = 500
                if (num < 100) num = 100
                await patchAppConfig({ connectionInterval: num })
                await restartMihomoConnections()
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

export default ConnectionSettingModal
