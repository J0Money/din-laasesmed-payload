import type { Block } from 'payload'

import { articleWithFormBlock } from './ArticleWithForm'
import { brandGridBlock } from './BrandGrid'
import { contactCardsBlock } from './ContactCards'
import { imageSliderBlock } from './ImageSlider'
import { jobListBlock } from './JobList'
import { overviewIntroBlock } from './OverviewIntro'
import { parallaxBandBlock } from './ParallaxBand'
import { peopleBlock } from './People'
import { prepareBlocks } from './fields/blockRowLabel'
import { textBlock } from './Text'
import { thanksMessageBlock } from './ThanksMessage'
import { textWithImageBlock } from './TextWithImage'
import { videoHeroBlock } from './VideoHero'

const blocks: Block[] = [
  videoHeroBlock,
  overviewIntroBlock,
  contactCardsBlock,
  articleWithFormBlock,
  parallaxBandBlock,
  peopleBlock,
  imageSliderBlock,
  brandGridBlock,
  jobListBlock,
  thanksMessageBlock,
  textBlock,
  textWithImageBlock,
]

export const allBlocks = prepareBlocks(blocks)
