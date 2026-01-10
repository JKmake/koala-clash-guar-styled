import type { NavigateFunction } from 'react-router-dom'
import { t } from 'i18next'

type Driver = {
  drive: () => void
  destroy: () => void
  moveNext: () => void
}

let driverInstance: Driver | null = null
let cssLoaded = false

async function loadDriverModule(): Promise<typeof import('driver.js')> {
  if (!cssLoaded) {
    await import('driver.js/dist/driver.css')
    cssLoaded = true
  }
  return import('driver.js')
}

export async function createDriver(navigate: NavigateFunction): Promise<Driver> {
  if (driverInstance) return driverInstance

  const { driver } = await loadDriverModule()

  driverInstance = driver({
    showProgress: true,
    nextBtnText: t('guide.nextStep'),
    prevBtnText: t('guide.prevStep'),
    doneBtnText: t('guide.done'),
    progressText: '{{current}} / {{total}}',
    overlayOpacity: 0.9,
    steps: [
      {
        element: 'none',
        popover: {
          title: t('guide.welcome'),
          description: t('guide.welcomeDesc'),
          side: 'over',
          align: 'center'
        }
      },
      {
        element: '.side',
        popover: {
          title: t('guide.navbar'),
          description: t('guide.navbarDesc'),
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '.sysproxy-card',
        popover: {
          title: t('guide.card'),
          description: t('guide.cardDesc'),
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.main',
        popover: {
          title: t('guide.mainArea'),
          description: t('guide.mainAreaDesc'),
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '.profile-card',
        popover: {
          title: t('guide.profileManagement'),
          description: t('guide.profileManagementDesc'),
          side: 'right',
          align: 'start',
          onNextClick: async (): Promise<void> => {
            navigate('/profiles')
            setTimeout(() => {
              driverInstance?.moveNext()
            }, 0)
          }
        }
      },
      {
        element: '.profiles-sticky',
        popover: {
          title: t('guide.profileImport'),
          description: t('guide.profileImportDesc'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.substore-import',
        popover: {
          title: 'Sub-Store',
          description: t('guide.subStoreDesc'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.new-profile',
        popover: {
          title: t('guide.localProfile'),
          description: t('guide.localProfileDesc'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.sysproxy-card',
        popover: {
          title: t('guide.sysProxy'),
          description: t('guide.sysProxyDesc'),
          side: 'right',
          align: 'start',
          onNextClick: async (): Promise<void> => {
            navigate('/sysproxy')
            setTimeout(() => {
              driverInstance?.moveNext()
            }, 0)
          }
        }
      },
      {
        element: '.sysproxy-settings',
        popover: {
          title: t('guide.sysProxySettings'),
          description: t('guide.sysProxySettingsDesc'),
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '.tun-card',
        popover: {
          title: t('guide.tun'),
          description: t('guide.tunDesc'),
          side: 'right',
          align: 'start',
          onNextClick: async (): Promise<void> => {
            navigate('/tun')
            setTimeout(() => {
              driverInstance?.moveNext()
            }, 0)
          }
        }
      },
      {
        element: '.tun-settings',
        popover: {
          title: t('guide.tunSettings'),
          description: t('guide.tunSettingsDesc'),
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '.override-card',
        popover: {
          title: t('guide.override'),
          description: t('guide.overrideDesc'),
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '.dns-card',
        popover: {
          title: 'DNS',
          description: t('guide.dnsDesc'),
          side: 'right',
          align: 'center',
          onNextClick: async (): Promise<void> => {
            navigate('/profiles')
            setTimeout(() => {
              driverInstance?.moveNext()
            }, 0)
          }
        }
      },
      {
        element: 'none',
        popover: {
          title: t('guide.tutorialEnd'),
          description: t('guide.tutorialEndDesc'),
          side: 'top',
          align: 'center',
          onNextClick: async (): Promise<void> => {
            navigate('/profiles')
            setTimeout(() => {
              driverInstance?.destroy()
            }, 0)
          }
        }
      }
    ]
  })

  return driverInstance
}

export async function startTour(navigate: NavigateFunction): Promise<void> {
  const d = await createDriver(navigate)
  d.drive()
}

export function getDriver(): Driver | null {
  return driverInstance
}
