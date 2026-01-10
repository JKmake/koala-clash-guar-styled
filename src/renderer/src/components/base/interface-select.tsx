import React, { useEffect, useState } from 'react'
import { Select, SelectItem } from '@heroui/react'
import { getInterfaces } from '@renderer/utils/ipc'
import { useTranslation } from 'react-i18next'

const InterfaceSelect: React.FC<{
  value: string
  exclude?: string[]
  onChange: (iface: string) => void
}> = ({ value, onChange, exclude = [] }) => {
  const { t } = useTranslation()
  const [ifaces, setIfaces] = useState<string[]>([])
  useEffect(() => {
    const fetchInterfaces = async (): Promise<void> => {
      const names = Object.keys(await getInterfaces())
      setIfaces(names.filter((name) => !exclude.includes(name)))
    }
    fetchInterfaces()
  }, [])

  return (
    <Select
      size="sm"
      className="w-[300px]"
      selectedKeys={new Set([value])}
      disallowEmptySelection={true}
      onSelectionChange={(v) => onChange(v.currentKey as string)}
    >
      <SelectItem key="">{t('common.disabled')}</SelectItem>
      <>
        {ifaces.map((name) => (
          <SelectItem key={name}>{name}</SelectItem>
        ))}
      </>
    </Select>
  )
}

export default InterfaceSelect
