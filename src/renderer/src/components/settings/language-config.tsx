import React from 'react'
import SettingCard from '../base/base-setting-card'
import SettingItem from '../base/base-setting-item'
import { Select, SelectItem } from '@heroui/react'
import { useLanguage } from '@renderer/hooks/use-language'

const LanguageConfig: React.FC = () => {
  const { currentLanguage, changeLanguage, languages, t } = useLanguage()

  return (
    <SettingCard>
      <SettingItem title={t('settings.appearance.language')}>
        <Select
          size="sm"
          className="w-[200px]"
          selectedKeys={[currentLanguage]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as 'zh-CN' | 'en-US' | 'ru-RU'
            if (selected) {
              changeLanguage(selected)
            }
          }}
        >
          {languages.map((lang) => (
            <SelectItem key={lang.value}>
              {lang.nativeLabel}
            </SelectItem>
          ))}
        </Select>
      </SettingItem>
    </SettingCard>
  )
}

export default LanguageConfig
