import {
  cn,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Switch,
  Tooltip
} from '@heroui/react'
import React, { useState } from 'react'
import SettingItem from '../base/base-setting-item'
import { useOverrideConfig } from '@renderer/hooks/use-override-config'
import { restartCore } from '@renderer/utils/ipc'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { IoIosHelpCircle } from 'react-icons/io'
import { useTranslation } from 'react-i18next'

interface Props {
  item: ProfileItem
  isCurrent: boolean
  updateProfileItem: (item: ProfileItem) => Promise<void>
  onClose: () => void
}

const EditInfoModal: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { item, isCurrent, updateProfileItem, onClose } = props
  const { appConfig: { disableAnimation = false } = {} } = useAppConfig()
  const { overrideConfig } = useOverrideConfig()
  const { items: overrideItems = [] } = overrideConfig || {}
  const [values, setValues] = useState({ ...item, autoUpdate: item.autoUpdate ?? true })
  const inputWidth = 'w-[400px] md:w-[400px] lg:w-[600px] xl:w-[800px]'

  const onSave = async (): Promise<void> => {
    try {
      const itemToSave = {
        ...values,
        override: values.override?.filter(
          (i) =>
            overrideItems.find((t) => t.id === i) && !overrideItems.find((t) => t.id === i)?.global
        )
      }

      await updateProfileItem(itemToSave)
      if (item.id && isCurrent) {
        await restartCore()
      }
      onClose()
    } catch (e) {
      alert(e)
    }
  }

  return (
    <Modal
      backdrop={disableAnimation ? 'transparent' : 'blur'}
      disableAnimation={disableAnimation}
      size="5xl"
      classNames={{
        backdrop: 'top-[48px]',
        base: 'w-[600px] md:w-[600px] lg:w-[800px] xl:w-[1024px]'
      }}
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex app-drag">
          {item.id ? t('profile.editInfo') : t('profile.importRemoteConfig')}
        </ModalHeader>
        <ModalBody>
          <SettingItem title={t('profile.name')}>
            <Input
              size="sm"
              className={cn(inputWidth)}
              value={values.name}
              onValueChange={(v) => {
                setValues({ ...values, name: v })
              }}
            />
          </SettingItem>
          {values.type === 'remote' && (
            <>
              <SettingItem title={t('profile.subscriptionAddress')}>
                <Input
                  size="sm"
                  className={cn(inputWidth)}
                  value={values.url}
                  onValueChange={(v) => {
                    setValues({ ...values, url: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.customUA')}>
                <Input
                  size="sm"
                  className={cn(inputWidth)}
                  value={values.ua ?? ''}
                  onValueChange={(v) => {
                    setValues({ ...values, ua: v.trim() || undefined })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.verifyFormat')}>
                <Switch
                  size="sm"
                  isSelected={values.verify ?? false}
                  onValueChange={(v) => {
                    setValues({ ...values, verify: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.useProxyUpdate')}>
                <Switch
                  size="sm"
                  isSelected={values.useProxy ?? false}
                  onValueChange={(v) => {
                    setValues({ ...values, useProxy: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.autoUpdate')}>
                <Switch
                  size="sm"
                  isSelected={values.autoUpdate ?? false}
                  onValueChange={(v) => {
                    setValues({ ...values, autoUpdate: v })
                  }}
                />
              </SettingItem>
              {values.autoUpdate && (
                <SettingItem
                  title={t('profile.updateIntervalMinutes')}
                  actions={
                    values.locked && (
                      <Tooltip content={t('profile.updateIntervalLockedHelp')}>
                        <Button isIconOnly size="sm" variant="light">
                          <IoIosHelpCircle className="text-lg" />
                        </Button>
                      </Tooltip>
                    )
                  }
                >
                  <Input
                    size="sm"
                    type="number"
                    className={cn(inputWidth)}
                    value={values.interval?.toString() ?? ''}
                    onValueChange={(v) => {
                      setValues({ ...values, interval: parseInt(v) })
                    }}
                    disabled={values.locked}
                  />
                </SettingItem>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button size="sm" variant="light" onPress={onClose}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" color="primary" onPress={onSave}>
            {item.id ? t('common.save') : t('common.import')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditInfoModal
