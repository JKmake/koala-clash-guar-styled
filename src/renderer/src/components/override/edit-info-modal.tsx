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
  Select,
  SelectItem
} from '@heroui/react'
import React, { useState } from 'react'
import SettingItem from '../base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { restartCore } from '@renderer/utils/ipc'
import { useTranslation } from 'react-i18next'

interface Props {
  item: OverrideItem
  updateOverrideItem: (item: OverrideItem) => Promise<void>
  onClose: () => void
}

const EditInfoModal: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const { item, updateOverrideItem, onClose } = props
  const { appConfig: { disableAnimation = false } = {} } = useAppConfig()
  const [values, setValues] = useState(item)
  const inputWidth = 'w-[400px] md:w-[400px] lg:w-[600px] xl:w-[800px]'

  const onSave = async (): Promise<void> => {
    try {
      const itemToSave = {
        ...values
      }

      await updateOverrideItem(itemToSave)
      if (item.id) {
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
          {item.id ? t('override.editOverrideInfo') : t('override.importRemoteOverride')}
        </ModalHeader>
        <ModalBody>
          <SettingItem title={t('override.name')}>
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
              <SettingItem title={t('override.overrideAddress')}>
                <Input
                  size="sm"
                  className={cn(inputWidth)}
                  value={values.url || ''}
                  onValueChange={(v) => {
                    setValues({ ...values, url: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('override.certificateFingerprint')}>
                <Input
                  size="sm"
                  className={cn(inputWidth)}
                  value={values.fingerprint ?? ''}
                  onValueChange={(v) => {
                    setValues({ ...values, fingerprint: v.trim() || undefined })
                  }}
                />
              </SettingItem>
            </>
          )}
          <SettingItem title={t('override.fileType')}>
            <Select
              size="sm"
              className={cn(inputWidth)}
              selectedKeys={[values.ext]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as 'js' | 'yaml'
                setValues({ ...values, ext: key })
              }}
            >
              <SelectItem key="yaml">YAML</SelectItem>
              <SelectItem key="js">JavaScript</SelectItem>
            </Select>
          </SettingItem>
          <SettingItem title={t('override.globalOverride')}>
            <Switch
              size="sm"
              isSelected={values.global ?? false}
              onValueChange={(v) => {
                setValues({ ...values, global: v })
              }}
            />
          </SettingItem>
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
