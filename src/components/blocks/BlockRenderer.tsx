import { Fragment } from 'react'
import type React from 'react'

import { ArticleWithForm } from '@/blocks/ArticleWithForm'
import { BrandGrid } from '@/blocks/BrandGrid'
import { ContactCards } from '@/blocks/ContactCards'
import { spacingClasses } from '@/blocks/fields/spacing'
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

function renderBlock(block: LayoutBlock): React.ReactNode {
  switch (block.blockType) {
    case 'homeHero':
      return <HomeHero {...block} />
    case 'homeIntro':
      return <HomeIntro {...block} />
    case 'homeTestimonials':
      return <HomeTestimonials {...block} />
    case 'homeStats':
      return <HomeStats {...block} />
    case 'homeFocusCards':
      return <HomeFocusCards {...block} />
    case 'homeCustomers':
      return <HomeCustomers {...block} />
    case 'videoHero':
      return <VideoHero {...block} />
    case 'overviewIntro':
      return <OverviewIntro {...block} />
    case 'contactCards':
      return <ContactCards {...block} />
    case 'articleWithForm':
      return <ArticleWithForm {...block} />
    case 'parallaxBand':
      return <ParallaxBand {...block} />
    case 'people':
      return <People {...block} />
    case 'imageSlider':
      return <ImageSlider {...block} />
    case 'brandGrid':
      return <BrandGrid />
    case 'formPage':
      return <FormPage {...block} />
    case 'jobList':
      return <JobList {...block} />
    case 'thanksMessage':
      return <ThanksMessage {...block} />
    case 'text':
      return <Text {...block} />
    case 'textWithImage':
      return <TextWithImage {...block} />
    default:
      return null
  }
}

export function BlockRenderer({ blocks }: { blocks: LayoutBlocks | null | undefined }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => {
        const key = block.id ?? index
        const spacing =
          'spacingBefore' in block ? spacingClasses(block.blockType, block.spacingBefore, block.spacingAfter) : ''
        // Blocks on their own padding render unwrapped, exactly as before the spacing fields existed.
        if (!spacing) return <Fragment key={key}>{renderBlock(block)}</Fragment>
        return (
          <div key={key} className={`contents ${spacing}`}>
            {renderBlock(block)}
          </div>
        )
      })}
    </>
  )
}
