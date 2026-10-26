import { ArticleWithForm } from '@/blocks/ArticleWithForm'
import { BrandGrid } from '@/blocks/BrandGrid'
import { ContactCards } from '@/blocks/ContactCards'
import { ImageSlider } from '@/blocks/ImageSlider'
import { JobList } from '@/blocks/JobList'
import { OverviewIntro } from '@/blocks/OverviewIntro'
import { ParallaxBand } from '@/blocks/ParallaxBand'
import { People } from '@/blocks/People'
import { Text } from '@/blocks/Text'
import { ThanksMessage } from '@/blocks/ThanksMessage'
import { TextWithImage } from '@/blocks/TextWithImage'
import { VideoHero } from '@/blocks/VideoHero'
import type { Page } from '@/payload-types'

type LayoutBlocks = NonNullable<Page['layout']>
type LayoutBlock = LayoutBlocks[number]

export function BlockRenderer({ blocks }: { blocks: LayoutBlocks | null | undefined }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block: LayoutBlock) => {
        switch (block.blockType) {
          case 'videoHero':
            return <VideoHero key={block.id} {...block} />
          case 'overviewIntro':
            return <OverviewIntro key={block.id} {...block} />
          case 'contactCards':
            return <ContactCards key={block.id} {...block} />
          case 'articleWithForm':
            return <ArticleWithForm key={block.id} {...block} />
          case 'parallaxBand':
            return <ParallaxBand key={block.id} {...block} />
          case 'people':
            return <People key={block.id} {...block} />
          case 'imageSlider':
            return <ImageSlider key={block.id} {...block} />
          case 'brandGrid':
            return <BrandGrid key={block.id} />
          case 'jobList':
            return <JobList key={block.id} {...block} />
          case 'thanksMessage':
            return <ThanksMessage key={block.id} {...block} />
          case 'text':
            return <Text key={block.id} {...block} />
          case 'textWithImage':
            return <TextWithImage key={block.id} {...block} />
          default:
            return null
        }
      })}
    </>
  )
}
