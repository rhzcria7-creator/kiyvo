// JSON-LD do schema.org/Article para SEO nos posts de blog
export function JsonLdArticle({
  titulo, descricao, autor, data, url, imagem,
}: { titulo: string; descricao: string; autor: string; data: string; url: string; imagem?: string }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: titulo,
    description: descricao,
    author: { '@type': 'Person', name: autor },
    datePublished: data,
    dateModified: data,
    publisher: {
      '@type': 'Organization',
      name: 'KIYVO',
      logo: { '@type': 'ImageObject', url: 'https://kiyvo.com.br/logo-full.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: imagem || 'https://kiyvo.com.br/og-image.png',
    inLanguage: 'pt-BR',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
