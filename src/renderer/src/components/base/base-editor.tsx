import { useRef } from 'react'
import * as monaco from 'monaco-editor'
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor'
import { configureMonacoYaml } from 'monaco-yaml'
import metaSchema from 'meta-json-schema/schemas/meta-json-schema.json'
import pac from 'types-pac/pac.d.ts?raw'
import { useTheme } from 'next-themes'
import { nanoid } from 'nanoid'
import React from 'react'
import { useAppConfig } from '@renderer/hooks/use-app-config'
import { t } from 'i18next'
type Language = 'yaml' | 'javascript' | 'css' | 'json' | 'text'

interface Props {
  value: string
  originalValue?: string
  diffRenderSideBySide?: boolean
  readOnly?: boolean
  language: Language
  onChange?: (value: string) => void
}

let initialized = false
const monacoInitialization = (): void => {
  if (initialized) return

  const insertPrefixDescription = t('editor.schema.insertPrefix')
  const appendSuffixDescription = t('editor.schema.appendSuffix')
  const forceOverrideDescription = t('editor.schema.forceOverride')

  // configure yaml worker
  configureMonacoYaml(monaco, {
    validate: true,
    enableSchemaRequest: true,
    schemas: [
      {
        uri: 'http://example.com/meta-json-schema.json',
        fileMatch: ['**/*.clash.yaml'],
        // @ts-ignore // type JSONSchema7
        schema: {
          ...metaSchema,
          patternProperties: {
            '\\+rules': {
              type: 'array',
              $ref: '#/definitions/rules',
              description: insertPrefixDescription
            },
            'rules\\+': {
              type: 'array',
              $ref: '#/definitions/rules',
              description: appendSuffixDescription
            },
            '\\+proxies': {
              type: 'array',
              $ref: '#/definitions/proxies',
              description: insertPrefixDescription
            },
            'proxies\\+': {
              type: 'array',
              $ref: '#/definitions/proxies',
              description: appendSuffixDescription
            },
            '\\+proxy-groups': {
              type: 'array',
              $ref: '#/definitions/proxy-groups',
              description: insertPrefixDescription
            },
            'proxy-groups\\+': {
              type: 'array',
              $ref: '#/definitions/proxy-groups',
              description: appendSuffixDescription
            },
            '^\\+': {
              type: 'array',
              description: insertPrefixDescription
            },
            '\\+$': {
              type: 'array',
              description: appendSuffixDescription
            },
            '!$': {
              type: 'object',
              description: forceOverrideDescription
            }
          }
        }
      }
    ]
  })
  // configure PAC definition
  monaco.languages.typescript.javascriptDefaults.addExtraLib(pac, 'pac.d.ts')
  initialized = true
}

export const BaseEditor: React.FC<Props> = (props) => {
  const { theme, systemTheme } = useTheme()
  const trueTheme = theme === 'system' ? systemTheme : theme
  const {
    value,
    originalValue,
    diffRenderSideBySide = false,
    readOnly = false,
    language,
    onChange
  } = props
  const { appConfig: { disableAnimation = false } = {} } = useAppConfig()

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(undefined)
  const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor>(undefined)

  const editorWillMount = (): void => {
    monacoInitialization()
  }

  const editorDidMount = (editor: monaco.editor.IStandaloneCodeEditor): void => {
    editorRef.current = editor

    const uri = monaco.Uri.parse(`${nanoid()}.${language === 'yaml' ? 'clash' : ''}.${language}`)
    const model = monaco.editor.createModel(value, language, uri)
    editorRef.current.setModel(model)
  }
  const diffEditorDidMount = (editor: monaco.editor.IStandaloneDiffEditor): void => {
    diffEditorRef.current = editor

    const originalUri = monaco.Uri.parse(
      `original-${nanoid()}.${language === 'yaml' ? 'clash' : ''}.${language}`
    )
    const modifiedUri = monaco.Uri.parse(
      `modified-${nanoid()}.${language === 'yaml' ? 'clash' : ''}.${language}`
    )
    const originalModel = monaco.editor.createModel(originalValue || '', language, originalUri)
    const modifiedModel = monaco.editor.createModel(value, language, modifiedUri)
    diffEditorRef.current.setModel({
      original: originalModel,
      modified: modifiedModel
    })
  }

  const options = {
    tabSize: ['yaml', 'javascript', 'json'].includes(language) ? 2 : 4, // Set indentation by language.
    minimap: {
      enabled: document.documentElement.clientWidth >= 1500 // Show minimap scrollbar above a width threshold.
    },
    mouseWheelZoom: true, // Hold Ctrl + wheel to zoom.
    readOnly: readOnly, // Read-only mode.
    renderValidationDecorations: 'on' as 'off' | 'on' | 'editable', // Show validation in read-only mode.
    quickSuggestions: {
      strings: true, // Suggestions for strings.
      comments: true, // Suggestions for comments.
      other: true // Suggestions for other items.
    },
    fontFamily: `Maple Mono NF CN,Fira Code, JetBrains Mono, Roboto Mono, "Source Code Pro", Consolas, Menlo, Monaco, monospace, "Courier New", "Apple Color Emoji", "Noto Color Emoji"`,
    fontLigatures: true, // Enable ligatures.
    smoothScrolling: !disableAnimation, // Disable smooth scrolling when animations are off.
    pixelRatio: window.devicePixelRatio, // Use device pixel ratio.
    renderSideBySide: diffRenderSideBySide, // Side-by-side diff.
    glyphMargin: false, // Disable glyph margin.
    folding: true, // Enable code folding.
    scrollBeyondLastLine: false, // Prevent scrolling past last line.
    automaticLayout: true, // Auto layout.
    wordWrap: 'on' as 'on' | 'off', // Word wrap.
    // Performance options when animations are disabled.
    cursorBlinking: (disableAnimation ? 'solid' : 'blink') as 'solid' | 'blink', // Disable cursor blinking.
    cursorSmoothCaretAnimation: (disableAnimation ? 'off' : 'on') as 'off' | 'on', // Disable caret animation.
    scrollbar: {
      useShadows: !disableAnimation, // Disable scrollbar shadows.
      verticalScrollbarSize: disableAnimation ? 10 : 14, // Reduce scrollbar size.
      horizontalScrollbarSize: disableAnimation ? 10 : 14
    },
    suggest: {
      insertMode: (disableAnimation ? 'replace' : 'insert') as 'replace' | 'insert', // Simplify suggestion insert mode.
      showIcons: !disableAnimation // Disable suggestion icons to reduce rendering.
    },
    hover: {
      enabled: !disableAnimation, // Disable hover tooltips.
      delay: disableAnimation ? 0 : 300
    }
  }

  if (originalValue !== undefined) {
    return (
      <MonacoDiffEditor
        language={language}
        original={originalValue}
        value={value}
        height="100%"
        theme={trueTheme?.includes('light') ? 'vs' : 'vs-dark'}
        options={options}
        editorWillMount={editorWillMount}
        editorDidMount={diffEditorDidMount}
        editorWillUnmount={(): void => {}}
        onChange={onChange}
      />
    )
  }

  return (
    <MonacoEditor
      language={language}
      value={value}
      height="100%"
      theme={trueTheme?.includes('light') ? 'vs' : 'vs-dark'}
      options={options}
      editorWillMount={editorWillMount}
      editorDidMount={editorDidMount}
      editorWillUnmount={(): void => {}}
      onChange={onChange}
    />
  )
}
