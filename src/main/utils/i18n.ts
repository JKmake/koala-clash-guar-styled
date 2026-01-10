// i18n module for main process

type Translations = {
  [key: string]: string
}

type LocaleTranslations = {
  tray: Translations
}

const zhCN: LocaleTranslations = {
  tray: {
    userCancelled: '用户取消操作',
    userCancelledCheck: '用户已取消',
    coreStartError: '内核启动出错',
    showWindow: '显示窗口',
    hideFloatingWindow: '关闭悬浮窗',
    showFloatingWindow: '显示悬浮窗',
    systemProxy: '系统代理',
    virtualNetwork: '虚拟网卡',
    outboundMode: '出站模式',
    rule: '规则',
    global: '全局',
    direct: '直连',
    ruleMode: '规则模式',
    globalMode: '全局模式',
    directMode: '直连模式',
    subscriptionConfig: '订阅配置',
    openDirectory: '打开目录',
    appDirectory: '应用目录',
    workDirectory: '工作目录',
    coreDirectory: '内核目录',
    logDirectory: '日志目录',
    copyEnvVariables: '复制环境变量',
    quitKeepCore: '保留内核退出',
    restartApp: '重启应用',
    quitApp: '退出应用',
    retest: '重新测试',
    controllerListenError: '控制器监听错误',
    tunStartFailed: '虚拟网卡启动失败，前往内核设置页尝试手动授予内核权限'
  }
}

const enUS: LocaleTranslations = {
  tray: {
    userCancelled: 'User cancelled operation',
    userCancelledCheck: 'User cancelled',
    coreStartError: 'Core startup error',
    showWindow: 'Show Window',
    hideFloatingWindow: 'Hide Floating Window',
    showFloatingWindow: 'Show Floating Window',
    systemProxy: 'System Proxy',
    virtualNetwork: 'Virtual Network Interface',
    outboundMode: 'Outbound Mode',
    rule: 'Rule',
    global: 'Global',
    direct: 'Direct',
    ruleMode: 'Rule Mode',
    globalMode: 'Global Mode',
    directMode: 'Direct Mode',
    subscriptionConfig: 'Profiles',
    openDirectory: 'Open Directory',
    appDirectory: 'App Directory',
    workDirectory: 'Work Directory',
    coreDirectory: 'Core Directory',
    logDirectory: 'Log Directory',
    copyEnvVariables: 'Copy Environment Variables',
    quitKeepCore: 'Quit Keep Core',
    restartApp: 'Restart App',
    quitApp: 'Quit App',
    retest: 'Retest',
    controllerListenError: 'Controller listen error',
    tunStartFailed:
      'Virtual network interface startup failed, go to core settings to try to manually grant core permissions'
  }
}

const ruRU: LocaleTranslations = {
  tray: {
    userCancelled: 'Операция отменена пользователем',
    userCancelledCheck: 'Отменено пользователем',
    coreStartError: 'Ошибка запуска ядра',
    showWindow: 'Показать окно',
    hideFloatingWindow: 'Скрыть плавающее окно',
    showFloatingWindow: 'Показать плавающее окно',
    systemProxy: 'Системный прокси',
    virtualNetwork: 'Виртуальный сетевой интерфейс',
    outboundMode: 'Режим выхода',
    rule: 'Правило',
    global: 'Глобальный',
    direct: 'Прямой',
    ruleMode: 'Режим правил',
    globalMode: 'Глобальный режим',
    directMode: 'Прямой режим',
    subscriptionConfig: 'Профили',
    openDirectory: 'Открыть директорию',
    appDirectory: 'Директория приложения',
    workDirectory: 'Рабочая директория',
    coreDirectory: 'Директория ядра',
    logDirectory: 'Директория логов',
    copyEnvVariables: 'Копировать переменные окружения',
    quitKeepCore: 'Выйти, сохранив ядро',
    restartApp: 'Перезапустить приложение',
    quitApp: 'Выйти из приложения',
    retest: 'Повторить тест',
    controllerListenError: 'Ошибка прослушивания контроллера',
    tunStartFailed:
      'Виртуальный сетевой интерфейс не запустился, перейдите в настройки ядра и попробуйте вручную предоставить права'
  }
}

const locales: { [key: string]: LocaleTranslations } = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ru-RU': ruRU
}

let currentLanguage = 'ru-RU'

export function setLanguage(lang: string): void {
  if (locales[lang]) {
    currentLanguage = lang
  }
}

export function getLanguage(): string {
  return currentLanguage
}

export function t(key: string): string {
  const [namespace, translationKey] = key.split('.')
  const locale = locales[currentLanguage] || locales['zh-CN']

  if (namespace === 'tray' && locale.tray[translationKey]) {
    return locale.tray[translationKey]
  }

  // Fallback to Chinese if translation not found
  const fallback = locales['en-US']
  if (namespace === 'tray' && fallback.tray[translationKey]) {
    return fallback.tray[translationKey]
  }

  return key
}
