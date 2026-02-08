import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/lib/utils'
import SettingItem from '../base/base-setting-item'
import { restartCore } from '@renderer/utils/ipc'
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
  const [values, setValues] = useState({ ...item, autoUpdate: item.autoUpdate ?? true })
  const inputWidth = 'w-[300px] md:w-[300px] lg:w-[500px] xl:w-[700px]'

  const onSave = async (): Promise<void> => {
    try {
      const itemToSave = { ...values }

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
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="w-[600px] md:w-[600px] lg:w-[800px] xl:w-[1024px] sm:max-w-none"
        showCloseButton={false}
      >
        <DialogHeader className="app-drag">
          <DialogTitle>
            {item.id ? t('profile.editInfo') : t('profile.importRemoteConfig')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[60vh]">
          <SettingItem title={t('profile.name')}>
            <Input
              className={cn(inputWidth, 'h-8')}
              value={values.name}
              onChange={(e) => {
                setValues({ ...values, name: e.target.value })
              }}
            />
          </SettingItem>
          {values.type === 'remote' && (
            <>
              <SettingItem title={t('profile.subscriptionAddress')}>
                <Input
                  className={cn(inputWidth, 'h-8')}
                  value={values.url}
                  onChange={(e) => {
                    setValues({ ...values, url: e.target.value })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.customUA')}>
                <Input
                  className={cn(inputWidth, 'h-8')}
                  value={values.ua ?? ''}
                  onChange={(e) => {
                    setValues({ ...values, ua: e.target.value.trim() || undefined })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.verifyFormat')}>
                <Switch
                  size="sm"
                  checked={values.verify ?? true}
                  onCheckedChange={(v) => {
                    setValues({ ...values, verify: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.useProxyUpdate')}>
                <Switch
                  size="sm"
                  checked={values.useProxy ?? false}
                  onCheckedChange={(v) => {
                    setValues({ ...values, useProxy: v })
                  }}
                />
              </SettingItem>
              <SettingItem title={t('profile.autoUpdate')}>
                <Switch
                  size="sm"
                  checked={values.autoUpdate ?? false}
                  onCheckedChange={(v) => {
                    setValues({ ...values, autoUpdate: v })
                  }}
                />
              </SettingItem>
              {values.autoUpdate && (
                <SettingItem
                  title={t('profile.updateIntervalMinutes')}
                  actions={
                    values.locked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon-sm" variant="ghost">
                            <IoIosHelpCircle className="text-lg" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t('profile.updateIntervalLockedHelp')}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }
                >
                  <Input
                    type="number"
                    className={cn(inputWidth, 'h-8')}
                    value={values.interval?.toString() ?? ''}
                    onChange={(e) => {
                      setValues({ ...values, interval: parseInt(e.target.value) })
                    }}
                    disabled={values.locked}
                  />
                </SettingItem>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button size="sm" onClick={onSave}>
            {item.id ? t('common.save') : t('common.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditInfoModal
