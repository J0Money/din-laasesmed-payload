import Link from 'next/link'

import { mediaAlt, mediaUrl } from '@/lib/media'
import { getCms } from '@/lib/cms'
import { ROUTES } from '@/lib/routes'
import type { Article, Category } from '@/payload-types'

/**
 * "Læs også" under artiklen: op til 6 andre artikler fra samme kategori,
 * sorteret som på originalen (nyeste publicering først, dernæst oprettelse).
 */
export async function ReadAlso({ articleId, category }: { articleId: string; category: Category }) {
  const payload = await getCms()
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      category: { equals: category.id },
      id: { not_equals: articleId },
      _status: { equals: 'published' },
    },
    sort: ['-publishedAt', '-createdAt'],
    limit: 6,
    depth: 1,
  })

  if (!docs.length) return null

  return (
    <section>
      <div className="site-container flex flex-col gap-8 py-(--fluid-section) min-[992px]:flex-row min-[992px]:justify-between min-[992px]:gap-12">
        <div data-animate="fade-up" className="shrink-0">
          <Link
            href={ROUTES.category(category.slug)}
            className="flex items-center gap-3 text-base leading-[21px] font-medium text-brand-500"
          >
            <svg viewBox="0 0 18 15" fill="none" className="w-4 shrink-0" aria-hidden>
              <path
                d="M18 13.8325C18 14.0181 17.9271 14.1962 17.7972 14.3275C17.6674 14.4587 17.4913 14.5325 17.3077 14.5325C17.1241 14.5325 16.948 14.4587 16.8182 14.3275C16.6884 14.1962 16.6154 14.0181 16.6154 13.8325C16.6131 11.7911 15.8101 9.83396 14.3825 8.39048C12.9548 6.94699 11.0192 6.13502 9.00027 6.1327H2.36384L5.33635 9.13737C5.46625 9.26871 5.53922 9.44686 5.53922 9.63261C5.53922 9.81836 5.46625 9.9965 5.33635 10.1278C5.20644 10.2592 5.03026 10.333 4.84655 10.333C4.66284 10.333 4.48666 10.2592 4.35676 10.1278L0.203038 5.92796C0.138672 5.86295 0.0876096 5.78575 0.0527707 5.70077C0.0179319 5.6158 0 5.52471 0 5.43272C0 5.34073 0.0179319 5.24965 0.0527707 5.16467C0.0876096 5.0797 0.138672 5.0025 0.203038 4.93749L4.35676 0.737604C4.48666 0.606259 4.66284 0.532471 4.84655 0.532471C5.03026 0.532471 5.20644 0.606259 5.33635 0.737604C5.46625 0.868949 5.53922 1.04709 5.53922 1.23284C5.53922 1.41859 5.46625 1.59673 5.33635 1.72808L2.36384 4.73274H9.00027C11.3864 4.73529 13.674 5.69483 15.3613 7.40081C17.0485 9.10679 17.9975 11.4199 18 13.8325Z"
                fill="currentColor"
              />
            </svg>
            Tilbage til oversigten
          </Link>
          <h2 className="text-trim mt-7 mb-[10px] font-heading text-(length:--fluid-article-name) leading-[1.5] font-light text-ink-800">
            Læs også
          </h2>
        </div>

        <ArticlePreviewGrid articles={docs} />
      </div>
    </section>
  )
}

/** 768px gitter med små artikel-previews (64px billede + titel), som i "Læs også" og på mærkesiderne. */
export function ArticlePreviewGrid({ articles, className = '' }: { articles: Article[]; className?: string }) {
  return (
    <ul className={`grid gap-x-8 gap-y-6 min-[480px]:grid-cols-3 min-[992px]:w-[768px] ${className}`}>
      {articles.map((article) => {
        const thumb = mediaUrl(article.mainImage, 'thumbnail')
        return (
          <li key={article.id} data-animate="fade-left">
            <Link href={ROUTES.article(article.slug)} className="group flex items-center gap-3">
              {thumb && (
                <img
                  src={thumb}
                  alt={mediaAlt(article.mainImage)}
                  width={64}
                  height={43}
                  loading="lazy"
                  className="h-[43px] w-16 shrink-0 rounded-lg object-cover outline-[0.8px] outline-offset-[1.6px] outline-transparent outline-solid transition-[outline-color] duration-200 group-hover:outline-brand-500"
                />
              )}
              <span className="text-trim line-clamp-2 mt-[3px] mb-[10px] py-[3.2px] font-heading text-[15.2px] leading-[21.76px] text-ink-800">
                {article.name}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
