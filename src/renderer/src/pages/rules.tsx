import BasePage from '@renderer/components/base/base-page'
import RuleItem from '@renderer/components/rules/rule-item'
import { Virtuoso } from 'react-virtuoso'
import { useMemo, useState } from 'react'
import { Separator } from '@renderer/components/ui/separator'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { useRules } from '@renderer/hooks/use-rules'
import { includesIgnoreCase } from '@renderer/utils/includes'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RiDatabase2Line } from 'react-icons/ri'

const Rules: React.FC = () => {
  const { t } = useTranslation()
  const { rules } = useRules()
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()

  const filteredRules = useMemo(() => {
    if (!rules) return []
    if (filter === '') return rules.rules
    return rules.rules.filter((rule) => {
      return (
        includesIgnoreCase(rule.payload, filter) ||
        includesIgnoreCase(rule.type, filter) ||
        includesIgnoreCase(rule.proxy, filter)
      )
    })
  }, [rules, filter])

  return (
    <BasePage
      title={t('pages.rules.title')}
      header={
        <Button
          size="icon-sm"
          variant="ghost"
          className="app-nodrag"
          title={t('pages.resources.title')}
          onClick={() => navigate('/resources')}
        >
          <RiDatabase2Line className="text-lg" />
        </Button>
      }
    >
      <div className="sticky top-0 z-40">
        <div className="flex px-2 pb-2">
          <Input
            className="h-8 text-sm"
            value={filter}
            placeholder={t('common.filter')}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Separator />
      </div>
      <div className="h-[calc(100vh-108px)] mt-px">
        <Virtuoso
          data={filteredRules}
          itemContent={(i, rule) => (
            <RuleItem
              index={i}
              type={rule.type}
              payload={rule.payload}
              proxy={rule.proxy}
              size={rule.size}
            />
          )}
        />
      </div>
    </BasePage>
  )
}

export default Rules
