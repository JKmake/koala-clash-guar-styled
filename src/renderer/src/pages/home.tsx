import BasePage from '@renderer/components/base/base-page'
import { Switch } from '@heroui/react'

const Home: React.FC = () => {
  return (
    <BasePage>
      <div className="flex h-full items-center justify-center">
        <Switch
          size='lg'
          className='scale-500'
        >
        </Switch>
      </div>
    </BasePage>
  )
}

export default Home
