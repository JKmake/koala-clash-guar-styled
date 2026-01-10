import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react'
import React from 'react'
import SettingItem from '../base/base-setting-item'
import { calcTraffic } from '@renderer/utils/calc'
import dayjs from 'dayjs'
import { BiCopy } from 'react-icons/bi'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { t } from 'i18next'

interface Props {
  connection: ControllerConnectionDetail
  onClose: () => void
}

interface CopyProps {
  title: string
  value: string | string[]
  displayName?: string
  prefix?: string[]
}

const CopyableSettingItem: React.FC<CopyProps> = (props) => {
  const { title, value, displayName, prefix = [] } = props
  const getSubDomains = (domain: string): string[] =>
    domain.split('.').length <= 2
      ? [domain]
      : domain
          .split('.')
          .map((_, i, parts) => parts.slice(i).join('.'))
          .slice(0, -1)

  const isIPv6 = (ip: string): boolean => ip.includes(':')

  const menuItems = [
    { key: 'raw', text: displayName || (Array.isArray(value) ? value.join(', ') : value) },
    ...(Array.isArray(value)
      ? value
          .map((v, i) => {
            const p = prefix[i]
            if (!p || !v) return null

            if (p === 'DOMAIN-SUFFIX') {
              return getSubDomains(v).map((subV) => ({
                key: `${p},${subV}`,
                text: `${p},${subV}`
              }))
            }

            if (p === 'IP-ASN' || p === 'SRC-IP-ASN') {
              return {
                key: `${p},${v.split(' ')[0]}`,
                text: `${p},${v.split(' ')[0]}`
              }
            }

            const suffix =
              p === 'IP-CIDR' || p === 'SRC-IP-CIDR' ? (isIPv6(v) ? '/128' : '/32') : ''
            return {
              key: `${p},${v}${suffix}`,
              text: `${p},${v}${suffix}`
            }
          })
          .filter(Boolean)
          .flat()
      : prefix
          .map((p) => {
            const v = value as string
            if (p === 'DOMAIN-SUFFIX') {
              return getSubDomains(v).map((subV) => ({
                key: `${p},${subV}`,
                text: `${p},${subV}`
              }))
            }

            if (p === 'IP-ASN' || p === 'SRC-IP-ASN') {
              return {
                key: `${p},${v.split(' ')[0]}`,
                text: `${p},${v.split(' ')[0]}`
              }
            }

            const suffix =
              p === 'IP-CIDR' || p === 'SRC-IP-CIDR' ? (isIPv6(v) ? '/128' : '/32') : ''
            return {
              key: `${p},${v}${suffix}`,
              text: `${p},${v}${suffix}`
            }
          })
          .flat())
  ]

  return (
    <SettingItem
      title={title}
      actions={
        <Dropdown>
          <DropdownTrigger>
            <Button title={t('connection.copyRule')} isIconOnly size="sm" variant="light">
              <BiCopy className="text-lg" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            onAction={(key) =>
              navigator.clipboard.writeText(
                key === 'raw' ? (Array.isArray(value) ? value.join(', ') : value) : (key as string)
              )
            }
          >
            {menuItems
              .filter((item) => item !== null)
              .map(({ key, text }) => (
                <DropdownItem key={key}>{text}</DropdownItem>
              ))}
          </DropdownMenu>
        </Dropdown>
      }
    >
      <div className="flex items-center gap-2 truncate">
        <div className="truncate">
          {displayName || (Array.isArray(value) ? value.join(', ') : value)}
        </div>
      </div>
    </SettingItem>
  )
}

const ConnectionDetailModal: React.FC<Props> = (props) => {
  const { connection, onClose } = props
  const { appConfig: { disableAnimation = false } = {} } = useAppConfig()

  return (
    <Modal
      backdrop={disableAnimation ? 'transparent' : 'blur'}
      disableAnimation={disableAnimation}
      classNames={{ backdrop: 'top-[48px]' }}
      size="xl"
      hideCloseButton
      isOpen={true}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      <ModalContent className="flag-emoji break-all">
        <ModalHeader className="flex app-drag">{t('connection.connectionDetails')}</ModalHeader>
        <ModalBody>
          <SettingItem title={t('connection.connectionEstablished')}>
            <div className="truncate">{dayjs(connection.start).fromNow()}</div>
          </SettingItem>
          <SettingItem title={t('connection.rule')}>
            <div className="truncate">
              {connection.rule ? connection.rule : t('connection.noRuleMatched')}
              {connection.rulePayload ? `(${connection.rulePayload})` : ''}
            </div>
          </SettingItem>
          <SettingItem title={t('connection.proxyChain')}>
            <div className="truncate">{[...connection.chains].reverse().join('>>')}</div>
          </SettingItem>
          <SettingItem title={t('connection.uploadSpeed')}>
            <div className="truncate">{calcTraffic(connection.uploadSpeed || 0)}/s</div>
          </SettingItem>
          <SettingItem title={t('connection.downloadSpeed')}>
            <div className="truncate">{calcTraffic(connection.downloadSpeed || 0)}/s</div>
          </SettingItem>
          <SettingItem title={t('connection.uploadAmount')}>
            <div className="truncate">{calcTraffic(connection.upload)}</div>
          </SettingItem>
          <SettingItem title={t('connection.downloadAmount')}>
            <div className="truncate">{calcTraffic(connection.download)}</div>
          </SettingItem>
          <CopyableSettingItem
            title={t('connection.connectionType')}
            value={[connection.metadata.type, connection.metadata.network]}
            displayName={`${connection.metadata.type}(${connection.metadata.network})`}
            prefix={['IN-TYPE', 'NETWORK']}
          />
          {connection.metadata.host && (
            <CopyableSettingItem
              title={t('connection.host')}
              value={connection.metadata.host}
              prefix={['DOMAIN', 'DOMAIN-SUFFIX']}
            />
          )}
          {connection.metadata.sniffHost && (
            <CopyableSettingItem
              title={t('connection.sniffHost')}
              value={connection.metadata.sniffHost}
              prefix={['DOMAIN', 'DOMAIN-SUFFIX']}
            />
          )}
          {connection.metadata.process && connection.metadata.type != 'Inner' && (
            <CopyableSettingItem
              title={t('connection.processName')}
              value={[
                connection.metadata.process,
                ...(connection.metadata.uid ? [connection.metadata.uid.toString()] : [])
              ]}
              displayName={`${connection.metadata.process}${
                connection.metadata.uid ? `(${connection.metadata.uid})` : ''
              }`}
              prefix={['PROCESS-NAME', ...(connection.metadata.uid ? ['UID'] : [])]}
            />
          )}
          {connection.metadata.processPath && connection.metadata.type != 'Inner' && (
            <CopyableSettingItem
              title={t('connection.processPath')}
              value={connection.metadata.processPath}
              prefix={['PROCESS-PATH']}
            />
          )}
          {connection.metadata.sourceIP && (
            <CopyableSettingItem
              title={t('connection.sourceIP')}
              value={connection.metadata.sourceIP}
              prefix={['SRC-IP-CIDR']}
            />
          )}
          {connection.metadata.sourceGeoIP && connection.metadata.sourceGeoIP.length > 0 && (
            <CopyableSettingItem
              title={t('connection.sourceGeoIP')}
              value={connection.metadata.sourceGeoIP}
              prefix={['SRC-GEOIP']}
            />
          )}
          {connection.metadata.sourceIPASN && (
            <CopyableSettingItem
              title={t('connection.sourceASN')}
              value={connection.metadata.sourceIPASN}
              prefix={['SRC-IP-ASN']}
            />
          )}
          {connection.metadata.destinationIP && (
            <CopyableSettingItem
              title={t('connection.destinationIP')}
              value={connection.metadata.destinationIP}
              prefix={['IP-CIDR']}
            />
          )}
          {connection.metadata.destinationGeoIP &&
            connection.metadata.destinationGeoIP.length > 0 && (
              <CopyableSettingItem
                title={t('connection.destinationGeoIP')}
                value={connection.metadata.destinationGeoIP}
                prefix={['GEOIP']}
              />
            )}
          {connection.metadata.destinationIPASN && (
            <CopyableSettingItem
              title={t('connection.destinationASN')}
              value={connection.metadata.destinationIPASN}
              prefix={['IP-ASN']}
            />
          )}
          {connection.metadata.sourcePort && (
            <CopyableSettingItem
              title={t('connection.sourcePort')}
              value={connection.metadata.sourcePort}
              prefix={['SRC-PORT']}
            />
          )}
          {connection.metadata.destinationPort && (
            <CopyableSettingItem
              title={t('connection.destinationPort')}
              value={connection.metadata.destinationPort}
              prefix={['DST-PORT']}
            />
          )}
          {connection.metadata.inboundIP && (
            <CopyableSettingItem
              title={t('connection.inboundIP')}
              value={connection.metadata.inboundIP}
              prefix={['SRC-IP-CIDR']}
            />
          )}
          {connection.metadata.inboundPort !== '0' && (
            <CopyableSettingItem
              title={t('connection.inboundPort')}
              value={connection.metadata.inboundPort}
              prefix={['SRC-PORT']}
            />
          )}
          {connection.metadata.inboundName && (
            <CopyableSettingItem
              title={t('connection.inboundName')}
              value={connection.metadata.inboundName}
              prefix={['IN-NAME']}
            />
          )}
          {connection.metadata.inboundUser && (
            <CopyableSettingItem
              title={t('connection.inboundUser')}
              value={connection.metadata.inboundUser}
              prefix={['IN-USER']}
            />
          )}
          {connection.metadata.dscp !== 0 && (
            <CopyableSettingItem
              title="DSCP"
              value={connection.metadata.dscp.toString()}
              prefix={['DSCP']}
            />
          )}
          {connection.metadata.remoteDestination && (
            <CopyableSettingItem
              title={t('connection.remoteDestination')}
              value={connection.metadata.remoteDestination}
              prefix={['IP-CIDR']}
            />
          )}
          {connection.metadata.dnsMode && (
            <SettingItem title={t('connection.dnsMode')}>
              <div className="truncate">{connection.metadata.dnsMode}</div>
            </SettingItem>
          )}
          {connection.metadata.specialProxy && (
            <SettingItem title={t('connection.specialProxy')}>
              <div className="truncate">{connection.metadata.specialProxy}</div>
            </SettingItem>
          )}
          {connection.metadata.specialRules && (
            <SettingItem title={t('connection.specialRule')}>
              <div className="truncate">{connection.metadata.specialRules}</div>
            </SettingItem>
          )}
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

export default ConnectionDetailModal
