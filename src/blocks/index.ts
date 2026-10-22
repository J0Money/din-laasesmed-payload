import type { Block } from 'payload'

import { prepareBlocks } from './fields/blockRowLabel'
import { textBlock } from './Text'
import { textWithImageBlock } from './TextWithImage'

const blocks: Block[] = [textBlock, textWithImageBlock]

export const allBlocks = prepareBlocks(blocks)
