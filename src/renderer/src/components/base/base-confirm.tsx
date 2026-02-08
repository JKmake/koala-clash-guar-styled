import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@renderer/components/ui/dialog'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'

export interface ConfirmButton {
  key: string
  text: string
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  onPress: () => void | Promise<void>
}

interface Props {
  onChange: (open: boolean) => void
  title?: string
  description?: React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void | Promise<void>
  buttons?: ConfirmButton[]
  className?: string
}

const ConfirmModal: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const {
    onChange,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    buttons,
    className
  } = props

  const modalTitle = title || t('modal.pleaseConfirm')
  const modalConfirmText = confirmText || t('common.confirm')
  const modalCancelText = cancelText || t('common.cancel')

  const renderButtons = () => {
    if (buttons && buttons.length > 0) {
      return buttons.map((button) => (
        <Button
          key={button.key}
          size="sm"
          color={button.color || 'primary'}
          variant={button.variant || 'default'}
          onClick={async () => {
            await button.onPress()
            onChange(false)
          }}
        >
          {button.text}
        </Button>
      ))
    }

    return (
      <>
        <Button size="sm" variant="ghost" onClick={() => onChange(false)}>
          {modalCancelText}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={async () => {
            if (onConfirm) {
              await onConfirm()
            }
            onChange(false)
          }}
        >
          {modalConfirmText}
        </Button>
      </>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onChange}>
      <DialogContent className={['w-[400px]', className].filter(Boolean).join(' ')}>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>{renderButtons()}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
export default ConfirmModal
