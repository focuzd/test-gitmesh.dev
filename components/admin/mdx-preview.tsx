'use client'

import { useMemo, useState, useEffect } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import { AlertTriangle } from 'lucide-react'

interface MDXPreviewProps {
  content: string
}

// Custom components for MDX rendering
const components = {
  h1: (props: any) => <h1 className="text-3xl font-bold mb-4 text-gray-900" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-semibold mb-3 text-gray-900" {...props} />,
  h3: (props: any) => <h3 className="text-xl font-semibold mb-2 text-gray-900" {...props} />,
  h4: (props: any) => <h4 className="text-lg font-semibold mb-2 text-gray-900" {...props} />,
  h5: (props: any) => <h5 className="text-base font-semibold mb-2 text-gray-900" {...props} />,
  h6: (props: any) => <h6 className="text-sm font-semibold mb-2 text-gray-900" {...props} />,
  p: (props: any) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
  ul: (props: any) => <ul className="mb-4 ml-6 list-disc text-gray-700" {...props} />,
  ol: (props: any) => <ol className="mb-4 ml-6 list-decimal text-gray-700" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 italic text-gray-600 bg-blue-50 py-2" {...props} />
  ),
  code: (props: any) => (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto text-sm" {...props} />
  ),
  a: (props: any) => (
    <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
  ),
  img: (props: any) => (
    <img className="max-w-full h-auto rounded-lg mb-4" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-gray-300" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),
  hr: (props: any) => <hr className="my-8 border-gray-300" {...props} />,
}

export function MDXPreview({ content }: MDXPreviewProps) {
  const [serializedContent, setSerializedContent] = useState<MDXRemoteSerializeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!content.trim()) {
      setSerializedContent(null)
      setError(null)
      return
    }

    const serializeContent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Basic validation - check for common MDX issues
        if (content.includes('```') && !content.match(/```[\s\S]*?```/g)) {
          throw new Error('Unclosed code block')
        }

        const serialized = await serialize(content, {
          parseFrontmatter: true,
        })
        setSerializedContent(serialized)
      } catch (err) {
        console.error('MDX serialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to process MDX content')
        setSerializedContent(null)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(serializeContent, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [content])

  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-sm">No content to preview</div>
          <div className="text-xs mt-1">Start writing in the editor to see a preview</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-sm">Processing preview...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-medium">Preview Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!serializedContent) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-sm">No content to preview</div>
        </div>
      </div>
    )
  }

  try {
    return (
      <div className="prose prose-gray max-w-none">
        <MDXRemote {...serializedContent} components={components} />
      </div>
    )
  } catch (renderError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <div>
          <div className="font-medium">Render Error</div>
          <div className="text-sm">
            {renderError instanceof Error ? renderError.message : 'Failed to render MDX content'}
          </div>
        </div>
      </div>
    )
  }
}