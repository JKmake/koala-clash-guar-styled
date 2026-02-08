import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent, CardFooter } from '@renderer/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Progress } from '@renderer/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { useTranslation } from 'react-i18next'
import { calcPercent, calcTraffic } from '@renderer/utils/calc'
import { IoMdMore, IoMdRefresh } from 'react-icons/io'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import EditFileModal from './edit-file-modal'
import EditRulesModal from './edit-rules-modal'
import EditInfoModal from './edit-info-modal'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { openFile } from '@renderer/utils/ipc'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import ConfirmModal from '../base/base-confirm'

interface Props {
  info: ProfileItem
  isCurrent: boolean
  addProfileItem: (item: Partial<ProfileItem>) => Promise<void>
  updateProfileItem: (item: ProfileItem) => Promise<void>
  removeProfileItem: (id: string) => Promise<void>
  mutateProfileConfig: () => void
  onClick: () => Promise<void>
  switching: boolean
}

interface MenuItem {
  key: string
  label: string
  showDivider: boolean
  variant: 'default' | 'destructive'
}
const ProfileItem: React.FC<Props> = (props) => {
  const { t } = useTranslation()
  const {
    info,
    addProfileItem,
    removeProfileItem,
    mutateProfileConfig,
    updateProfileItem,
    onClick,
    isCurrent,
    switching
  } = props
  const extra = info?.extra
  const usage = (extra?.upload ?? 0) + (extra?.download ?? 0)
  const total = extra?.total ?? 0
  const { appConfig, patchAppConfig } = useAppConfig()
  const { profileDisplayDate = 'expire' } = appConfig || {}
  const [updating, setUpdating] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [openInfoEditor, setOpenInfoEditor] = useState(false)
  const [openFileEditor, setOpenFileEditor] = useState(false)
  const [openRulesEditor, setOpenRulesEditor] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform: tf,
    transition,
    isDragging
  } = useSortable({
    id: info.id
  })
  const transform = tf ? { x: tf.x, y: tf.y, scaleX: 1, scaleY: 1 } : null
  const [disableSelect, setDisableSelect] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const menuItems: MenuItem[] = useMemo(() => {
    const list = [
      {
        key: 'edit-info',
        label: t('profile.editInfo'),
        showDivider: false,
        variant: 'default'
      } as MenuItem,
      {
        key: 'edit-file',
        label: t('profile.editFile'),
        showDivider: false,
        variant: 'default'
      } as MenuItem,
      {
        key: 'edit-rules',
        label: t('profile.editRule'),
        showDivider: false,
        variant: 'default'
      } as MenuItem,
      {
        key: 'open-file',
        label: t('profile.openFile'),
        showDivider: true,
        variant: 'default'
      } as MenuItem,
      {
        key: 'delete',
        label: t('profile.delete'),
        showDivider: false,
        variant: 'destructive'
      } as MenuItem
    ]
    if (info.home) {
      list.unshift({
        key: 'home',
        label: t('profile.homepage'),
        showDivider: false,
        variant: 'default'
      } as MenuItem)
    }
    return list
  }, [info, t])

  const onMenuAction = (key: string): void => {
    switch (key) {
      case 'edit-info': {
        setOpenInfoEditor(true)
        break
      }
      case 'edit-file': {
        setOpenFileEditor(true)
        break
      }
      case 'edit-rules': {
        setOpenRulesEditor(true)
        break
      }
      case 'open-file': {
        openFile('profile')
        break
      }
      case 'delete': {
        setConfirmOpen(true)
        break
      }

      case 'home': {
        open(info.home)
        break
      }
    }
  }

  useEffect(() => {
    if (isDragging) {
      setTimeout(() => {
        setDisableSelect(true)
      }, 100)
    } else {
      setTimeout(() => {
        setDisableSelect(false)
      }, 100)
    }
  }, [isDragging])

  return (
    <div
      className="grid col-span-1"
      style={{
        position: 'relative',
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 'calc(infinity)' : undefined
      }}
    >
      {openFileEditor && (
        <EditFileModal
          id={info.id}
          onClose={() => setOpenFileEditor(false)}
        />
      )}
      {openRulesEditor && <EditRulesModal id={info.id} onClose={() => setOpenRulesEditor(false)} />}
      {openInfoEditor && (
        <EditInfoModal
          item={info}
          isCurrent={isCurrent}
          onClose={() => setOpenInfoEditor(false)}
          updateProfileItem={updateProfileItem}
        />
      )}
      {confirmOpen && (
        <ConfirmModal
          onChange={setConfirmOpen}
          title={t('profile.confirmDeleteProfile')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={() => {
            removeProfileItem(info.id)
            mutateProfileConfig()
          }}
        />
      )}
      <Card
        onClick={() => {
          if (disableSelect || switching) return
          setSelecting(true)
          onClick().finally(() => {
            setSelecting(false)
          })
        }}
        className={`w-full cursor-pointer py-0 gap-0 ${isCurrent ? 'bg-primary' : ''} ${selecting ? 'blur-sm' : ''}`}
      >
        <div ref={setNodeRef} {...attributes} {...listeners} className="w-full h-full">
          <CardContent className="px-4 pt-2 pb-1">
            <div className="flex justify-between h-[32px]">
              <h3
                title={info?.name}
                className={`text-ellipsis whitespace-nowrap overflow-hidden text-md font-bold leading-[32px] ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                {info?.name}
              </h3>
              <div className="flex" onClick={(e) => e.stopPropagation()}>
                {info.type === 'remote' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={updating}
                        onClick={async () => {
                          setUpdating(true)
                          await addProfileItem(info)
                          setUpdating(false)
                        }}
                      >
                        <IoMdRefresh
                          className={`${isCurrent ? 'text-primary-foreground' : 'text-foreground'} text-[24px] ${updating ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{dayjs(info.updated).fromNow()}</TooltipContent>
                  </Tooltip>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost">
                      <IoMdMore
                        className={`text-[24px] ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {menuItems.map((item) => (
                      <React.Fragment key={item.key}>
                        <DropdownMenuItem
                          variant={item.variant}
                          onClick={() => onMenuAction(item.key)}
                        >
                          {item.label}
                        </DropdownMenuItem>
                        {item.showDivider && <DropdownMenuSeparator />}
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {info.type === 'remote' && extra && (
              <div
                className={`mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                <small>{`${calcTraffic(usage)}/${calcTraffic(total)}`}</small>
                {profileDisplayDate === 'expire' ? (
                  <Button
                    size="xs"
                    variant="ghost"
                    className={`h-5 px-1 ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
                    onClick={async (event) => {
                      event.stopPropagation()
                      await patchAppConfig({ profileDisplayDate: 'update' })
                    }}
                  >
                    {extra.expire
                      ? dayjs.unix(extra.expire).format('YYYY-MM-DD')
                      : t('profile.longTermValid')}
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    variant="ghost"
                    className={`h-5 px-1 ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
                    onClick={async (event) => {
                      event.stopPropagation()
                      await patchAppConfig({ profileDisplayDate: 'expire' })
                    }}
                  >
                    {dayjs(info.updated).fromNow()}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 px-4 pb-2">
            {info.type === 'remote' && !extra && (
              <div
                className={`w-full mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                <Badge
                  variant="outline"
                  className={`rounded-sm ${isCurrent ? 'text-primary-foreground border-primary-foreground' : 'border-primary text-primary'}`}
                >
                  {t('common.remote')}
                </Badge>
                <small>{dayjs(info.updated).fromNow()}</small>
              </div>
            )}
            {info.type === 'local' && (
              <div
                className={`mt-2 flex justify-between ${isCurrent ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                <Badge
                  variant="outline"
                  className={`rounded-sm ${isCurrent ? 'text-primary-foreground border-primary-foreground' : 'border-primary text-primary'}`}
                >
                  {t('common.local')}
                </Badge>
              </div>
            )}
            {extra && (
              <Progress
                className={`w-full ${isCurrent ? '[&_[data-slot=progress-indicator]]:bg-primary-foreground' : '[&_[data-slot=progress-indicator]]:bg-foreground'}`}
                value={calcPercent(extra?.upload, extra?.download, extra?.total)}
              />
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

export default ProfileItem
