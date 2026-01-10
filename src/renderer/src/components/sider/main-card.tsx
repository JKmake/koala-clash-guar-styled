import { Button, Tooltip } from '@heroui/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { IoHomeOutline } from 'react-icons/io5'


interface Props {
  iconOnly?: boolean
}

const HomeCard: React.FC<Props> = () => {
  const { t } = useTranslation()
  const { appConfig } = useAppConfig()
  const { homeCardStatus = 'col-span-1' } = appConfig || {}
  const location = useLocation()
  const navigate = useNavigate()
  const match = location.pathname.includes('/home')

  return (
    <div className={`${homeCardStatus} flex justify-center`}>
      <Tooltip content={t('sider.home')} placement="right">
        <Button
          size="sm"
          isIconOnly
          color={match ? 'primary' : 'default'}
          variant={match ? 'solid' : 'light'}
          onPress={() => {
            navigate('/home')
          }}
        >
          <IoHomeOutline className="text-[20px]" />
        </Button>
      </Tooltip>
    </div>
  )
}

export default HomeCard
