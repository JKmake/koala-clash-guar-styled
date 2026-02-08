import { Button } from '@renderer/components/ui/button'
import { Checkbox } from '@renderer/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { Input } from '@renderer/components/ui/input'
import { Separator } from '@renderer/components/ui/separator'
import { Spinner } from '@renderer/components/ui/spinner'
import BasePage from '@renderer/components/base/base-page'
import ProfileItem from '@renderer/components/profiles/profile-item'
import EditInfoModal from '@renderer/components/profiles/edit-info-modal'
import { useProfileConfig } from '@renderer/hooks/use-profile-config'
import { getFilePath, readTextFile } from '@renderer/utils/ipc'
import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MdContentPaste } from 'react-icons/md'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { FaPlus } from 'react-icons/fa6'
import { IoMdRefresh } from 'react-icons/io'
import { MdTune } from 'react-icons/md'
import ProfileSettingModal from '@renderer/components/profiles/profile-setting-modal'
import { useTranslation } from 'react-i18next'

const emptyItems: ProfileItem[] = []

const Profiles: React.FC = () => {
  const { t } = useTranslation()
  const {
    profileConfig,
    setProfileConfig,
    addProfileItem,
    updateProfileItem,
    removeProfileItem,
    changeCurrentProfile,
    mutateProfileConfig
  } = useProfileConfig()
  const { current, items } = profileConfig || {}
  const itemsArray = items ?? emptyItems
  const [sortedItems, setSortedItems] = useState(itemsArray)
  const [useProxy, setUseProxy] = useState(false)
  const [importing, setImporting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [switching, setSwitching] = useState(false)
  const [fileOver, setFileOver] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProfileItem | null>(null)
  const [url, setUrl] = useState('')
  const isUrlEmpty = url.trim() === ''
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2
      }
    })
  )
  const handleImport = async (importUrl: string): Promise<void> => {
    setImporting(true)
    await addProfileItem({ name: '', type: 'remote', url: importUrl, useProxy, autoUpdate: true })
    setUrl('')
    setImporting(false)
  }
  const pageRef = useRef<HTMLDivElement>(null)

  const onDragEnd = async (event: DragEndEvent): Promise<void> => {
    const { active, over } = event
    if (over) {
      if (active.id !== over.id) {
        const newOrder = sortedItems.slice()
        const activeIndex = newOrder.findIndex((item) => item.id === active.id)
        const overIndex = newOrder.findIndex((item) => item.id === over.id)
        newOrder.splice(activeIndex, 1)
        newOrder.splice(overIndex, 0, itemsArray[activeIndex])
        setSortedItems(newOrder)
        await setProfileConfig({ current, items: newOrder })
      }
    }
  }

  const handleInputKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || isUrlEmpty) return
      handleImport((e.currentTarget as HTMLInputElement).value)
    },
    [isUrlEmpty]
  )

  useEffect(() => {
    pageRef.current?.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      setFileOver(true)
    })
    pageRef.current?.addEventListener('dragleave', (e) => {
      e.preventDefault()
      e.stopPropagation()
      setFileOver(false)
    })
    pageRef.current?.addEventListener('drop', async (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.dataTransfer?.files) {
        const file = event.dataTransfer.files[0]
        if (
          file.name.endsWith('.yml') ||
          file.name.endsWith('.yaml') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.jsonc') ||
          file.name.endsWith('.json5') ||
          file.name.endsWith('.txt')
        ) {
          try {
            const path = window.api.webUtils.getPathForFile(file)
            const content = await readTextFile(path)
            await addProfileItem({ name: file.name, type: 'local', file: content })
          } catch (e) {
            alert(t('pages.profiles.fileImportFailed') + e)
          }
        } else {
          alert(t('pages.profiles.unsupportedFileType'))
        }
      }
      setFileOver(false)
    })
    return (): void => {
      pageRef.current?.removeEventListener('dragover', () => {})
      pageRef.current?.removeEventListener('dragleave', () => {})
      pageRef.current?.removeEventListener('drop', () => {})
    }
  }, [])

  useEffect(() => {
    setSortedItems(itemsArray)
  }, [itemsArray])

  const handleMenuAction = async (action: 'open' | 'new' | 'import'): Promise<void> => {
    switch (action) {
      case 'open': {
        try {
          const files = await getFilePath(['yml', 'yaml'])
          if (files?.length) {
            const content = await readTextFile(files[0])
            const fileName = files[0].split('/').pop()?.split('\\').pop()
            await addProfileItem({ name: fileName, type: 'local', file: content })
          }
        } catch (e) {
          alert(e)
        }
        break
      }
      case 'new': {
        await addProfileItem({
          name: t('pages.profiles.newConfig'),
          type: 'local',
          file: 'proxies: []\nproxy-groups: []\nrules: []'
        })
        break
      }
      case 'import': {
        const newRemoteProfile: ProfileItem = {
          id: '',
          name: '',
          type: 'remote',
          url: '',
          useProxy: false,
          autoUpdate: true
        }
        setEditingItem(newRemoteProfile)
        setShowEditModal(true)
        break
      }
    }
  }

  return (
    <BasePage
      ref={pageRef}
      title={t('pages.profiles.title')}
      header={
        <>
          <Button
            size="icon-sm"
            title={t('pages.profiles.updateAll')}
            className="app-nodrag"
            variant="ghost"
            aria-label={t('pages.profiles.updateAll')}
            onClick={async () => {
              setUpdating(true)
              for (const item of itemsArray) {
                if (item.id === current) continue
                if (item.type !== 'remote') continue
                await addProfileItem(item)
              }
              const currentItem = itemsArray.find((item) => item.id === current)
              if (currentItem && currentItem.type === 'remote') {
                await addProfileItem(currentItem)
              }
              setUpdating(false)
            }}
          >
            <IoMdRefresh className={`text-lg ${updating ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="icon-sm"
            title={t('pages.profiles.profileSettings')}
            className="app-nodrag"
            variant="ghost"
            aria-label={t('pages.profiles.profileSettings')}
            onClick={() => setIsSettingModalOpen(true)}
          >
            <MdTune className="text-lg" />
          </Button>
        </>
      }
    >
      {isSettingModalOpen && <ProfileSettingModal onClose={() => setIsSettingModalOpen(false)} />}
      {showEditModal && editingItem && (
        <EditInfoModal
          item={editingItem}
          isCurrent={editingItem.id === current}
          updateProfileItem={async (item: ProfileItem) => {
            await addProfileItem(item)
            setShowEditModal(false)
            setEditingItem(null)
          }}
          onClose={() => {
            setShowEditModal(false)
            setEditingItem(null)
          }}
        />
      )}
      <div className="sticky profiles-sticky top-0 z-40 bg-background">
        <div className="flex flex-wrap items-center gap-2 p-2">
          <div className="flex flex-1 items-center gap-2 min-w-[220px]">
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyUp={handleInputKeyUp}
              className="flex-1"
            />
            <Button
              size="icon-sm"
              variant="ghost"
              className="z-10"
              onClick={() => {
                navigator.clipboard.readText().then((text) => {
                  setUrl(text)
                })
              }}
            >
              <MdContentPaste className="text-lg" />
            </Button>
            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
              <Checkbox
                checked={useProxy}
                onCheckedChange={(value) => {
                  setUseProxy(Boolean(value))
                }}
              />
              <span>{t('common.proxy')}</span>
            </label>
          </div>

          <Button
            size="sm"
            disabled={isUrlEmpty || importing}
            onClick={() => handleImport(url)}
          >
            {importing && <Spinner className="mr-2 size-4" />}
            {t('common.import')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="new-profile" size="icon-sm">
                <FaPlus />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleMenuAction('open')}>
                {t('pages.profiles.openLocalConfig')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleMenuAction('new')}>
                {t('pages.profiles.newLocalConfig')}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleMenuAction('import')}>
                {t('pages.profiles.importRemoteConfig')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div
          className={`${fileOver ? 'blur-sm' : ''} grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 m-2`}
        >
          <SortableContext
            items={sortedItems.map((item) => {
              return item.id
            })}
          >
            {sortedItems.map((item) => (
              <ProfileItem
                key={item.id}
                isCurrent={item.id === current}
                addProfileItem={addProfileItem}
                removeProfileItem={removeProfileItem}
                mutateProfileConfig={mutateProfileConfig}
                updateProfileItem={updateProfileItem}
                info={item}
                switching={switching}
                onClick={async () => {
                  setSwitching(true)
                  await changeCurrentProfile(item.id)
                  await new Promise((resolve) => setTimeout(resolve, 500))
                  setSwitching(false)
                }}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </BasePage>
  )
}

export default Profiles
