import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  Input,
  Tab,
  Tabs,
  Tooltip
} from '@heroui/react'
import React, { useState, useEffect, useRef } from 'react'
import SettingItem from '../base/base-setting-item'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { getGistUrl, getUserAgent } from '@renderer/utils/ipc'
import debounce from '@renderer/utils/debounce'
import { IoIosHelpCircle } from 'react-icons/io'
import { BiCopy } from 'react-icons/bi'
import { t } from 'i18next'

interface Props {
  onClose: () => void
}

const ProfileSettingModal: React.FC<Props> = (props) => {
  const { onClose } = props
  const { appConfig, patchAppConfig } = useAppConfig()

  const {
    profileDisplayDate = 'update',
    userAgent,
    diffWorkDir = false,
    githubToken = ''
  } = appConfig || {}

  const [ua, setUa] = useState(userAgent ?? '')
  const [defaultUserAgent, setDefaultUserAgent] = useState<string>('')
  const userAgentFetched = useRef(false)

  const setUaDebounce = debounce((v: string) => {
    patchAppConfig({ userAgent: v })
  }, 500)

  useEffect(() => {
    if (!userAgentFetched.current) {
      userAgentFetched.current = true
      getUserAgent().then((ua) => {
        setDefaultUserAgent(ua)
      })
    }
  }, [])

  useEffect(() => {
    setUa(userAgent ?? '')
  }, [userAgent])

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
        <ModalHeader className="flex pb-0">{t('pages.profiles.profileSettings')}</ModalHeader>
        <ModalBody className="py-2 gap-1">
          <SettingItem title={t('profile.showDate')} divider>
            <Tabs
              size="sm"
              color="primary"
              selectedKey={profileDisplayDate}
              onSelectionChange={async (v) => {
                await patchAppConfig({
                  profileDisplayDate: v as 'expire' | 'update'
                })
              }}
            >
              <Tab key="update" title={t('profile.dateUpdated')} />
              <Tab key="expire" title={t('profile.dateExpired')} />
            </Tabs>
          </SettingItem>
          <SettingItem
            title={t('profile.separateWorkDir')}
            actions={
              <Tooltip content={t('profile.separateWorkDirHelp')}>
                <Button isIconOnly size="sm" variant="light">
                  <IoIosHelpCircle className="text-lg" />
                </Button>
              </Tooltip>
            }
            divider
          >
            <Switch
              size="sm"
              isSelected={diffWorkDir}
              onValueChange={(v) => {
                patchAppConfig({ diffWorkDir: v })
              }}
            />
          </SettingItem>
          <SettingItem title={t('profile.subscriptionUA')} divider>
            <Input
              size="sm"
              className="w-[60%]"
              value={ua}
              placeholder={t('profile.defaultUserAgent', { value: defaultUserAgent })}
              onValueChange={(v) => {
                setUa(v)
                setUaDebounce(v)
              }}
            />
          </SettingItem>
          <SettingItem
            title={t('profile.syncRuntimeConfigGist')}
            actions={
              <Button
                title={t('profile.copyGistUrl')}
                isIconOnly
                size="sm"
                variant="light"
                onPress={async () => {
                  try {
                    const url = await getGistUrl()
                    if (url !== '') {
                      await navigator.clipboard.writeText(`${url}/raw/sparkle.yaml`)
                    }
                  } catch (e) {
                    alert(e)
                  }
                }}
              >
                <BiCopy className="text-lg" />
              </Button>
            }
          >
            <Input
              type="password"
              size="sm"
              className="w-[60%]"
              value={githubToken}
              placeholder={t('profile.githubToken')}
              onValueChange={(v) => {
                patchAppConfig({ githubToken: v })
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

export default ProfileSettingModal
