import { Badge } from '@renderer/components/ui/badge'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Progress } from '@renderer/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { cn } from '@renderer/lib/utils'
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
  const percent = calcPercent(extra?.upload, extra?.download, extra?.total)
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
  const updatedFromNow = dayjs(info.updated).fromNow()
  const expireLabel = extra?.expire
    ? dayjs.unix(extra.expire).format('YYYY-MM-DD')
    : t('profile.longTermValid')

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

  const trafficPercent = total > 0 ? Math.min(100, Math.round((usage / total) * 100)) : 0
  const hasLimit = total > 0
  const percentLabel = hasLimit ? `${percent}%` : t('pages.home.unlimited')
  const handleSelect = (): void => {
    if (disableSelect || switching) return
    setSelecting(true)
    onClick().finally(() => {
      setSelecting(false)
    })
  }

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
        <EditFileModal id={info.id} onClose={() => setOpenFileEditor(false)} />
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
        role="button"
        tabIndex={0}
        aria-selected={isCurrent}
        aria-busy={selecting || switching}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleSelect()
          }
        }}
        className={cn(
          'group w-full cursor-pointer py-0 gap-0 transition-all duration-150 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          isCurrent
            ? 'bg-primary/10 hover:bg-primary/15 border-primary/30 shadow-sm shadow-primary/10'
            : 'hover:bg-accent/50',
          selecting && 'opacity-60 scale-[0.98]',
          switching && 'cursor-wait'
        )}
      >
        <div ref={setNodeRef} {...attributes} {...listeners} className="w-full h-full">
          <CardContent className="px-4 py-3">
            {/* Header: name + actions */}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <h3
                      title={info?.name}
                      className="text-sm font-semibold truncate leading-tight text-foreground"
                    >
                      {info?.name}
                    </h3>
                    <Badge
                      variant="ghost"
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 rounded-md font-medium shrink-0',
                        info.type === 'remote'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      )}
                    >
                      {info.type === 'remote' ? t('common.remote') : t('common.local')}
                    </Badge>
                  </div>
                  <div
                    className="flex items-center shrink-0 gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                              className={cn(
                                'text-lg text-muted-foreground',
                                updating && 'animate-spin'
                              )}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">{updatedFromNow}</TooltipContent>
                      </Tooltip>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon-sm" variant="ghost">
                          <IoMdMore className="text-lg text-muted-foreground" />
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

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {info.type === 'local' && (
                    <span className="text-[11px] text-muted-foreground">
                      {t('profile.dateUpdated')}: {updatedFromNow}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info section for remote profiles */}
            {info.type === 'remote' && (
              <div className="mt-3 flex flex-col gap-2">
                {/* Traffic row */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {calcTraffic(usage)} / {total > 0 ? calcTraffic(total) : '∞'}
                  </span>
                  <span>{percentLabel}</span>
                </div>
                <Progress
                  className={cn(
                    'w-full h-1.5',
                    hasLimit
                      ? trafficPercent > 90
                        ? '**:data-[slot=progress-indicator]:bg-destructive'
                        : trafficPercent > 70
                          ? '**:data-[slot=progress-indicator]:bg-warning'
                          : '**:data-[slot=progress-indicator]:bg-primary'
                      : '**:data-[slot=progress-indicator]:bg-muted/40'
                  )}
                  value={hasLimit ? percent : 0}
                />
                {/* Updated + Expires row */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>
                    {t('profile.dateUpdated')}: {updatedFromNow}
                  </span>
                  <span>{expireLabel}</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

export default ProfileItem
