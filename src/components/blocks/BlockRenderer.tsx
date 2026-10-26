import { ArticleWithForm } from '@/blocks/ArticleWithForm'
import { BrandGrid } from '@/blocks/BrandGrid'
import { ContactCards } from '@/blocks/ContactCards'
import { FormPage } from '@/blocks/FormPage'
import { HomeCustomers } from '@/blocks/HomeCustomers'
import { HomeFocusCards } from '@/blocks/HomeFocusCards'
import { HomeHero } from '@/blocks/HomeHero'
import { HomeIntro } from '@/blocks/HomeIntro'
import { HomeStats } from '@/blocks/HomeStats'
import { HomeTestimonials } from '@/blocks/HomeTestimonials'
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
          case 'homeHero':
            return <HomeHero key={block.id} {...block} />
          case 'homeIntro':
            return <HomeIntro key={block.id} {...block} />
          case 'homeTestimonials':
            return <HomeTestimonials key={block.id} {...block} />
          case 'homeStats':
            return <HomeStats key={block.id} {...block} />
          case 'homeFocusCards':
            return <HomeFocusCards key={block.id} {...block} />
          case 'homeCustomers':
            return <HomeCustomers key={block.id} {...block} />
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
          case 'formPage':
            return <FormPage key={block.id} {...block} />
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
