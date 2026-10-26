import type { Block } from 'payload'

import { articleWithFormBlock } from './ArticleWithForm'
import { brandGridBlock } from './BrandGrid'
import { contactCardsBlock } from './ContactCards'
import { formPageBlock } from './FormPage'
import { homeCustomersBlock } from './HomeCustomers'
import { homeFocusCardsBlock } from './HomeFocusCards'
import { homeHeroBlock } from './HomeHero'
import { homeIntroBlock } from './HomeIntro'
import { homeStatsBlock } from './HomeStats'
import { homeTestimonialsBlock } from './HomeTestimonials'
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
  homeHeroBlock,
  homeIntroBlock,
  homeTestimonialsBlock,
  homeStatsBlock,
  homeFocusCardsBlock,
  homeCustomersBlock,
  videoHeroBlock,
  overviewIntroBlock,
  contactCardsBlock,
  articleWithFormBlock,
  parallaxBandBlock,
  peopleBlock,
  imageSliderBlock,
  brandGridBlock,
  jobListBlock,
  formPageBlock,
  thanksMessageBlock,
  textBlock,
  textWithImageBlock,
]

export const allBlocks = prepareBlocks(blocks)
