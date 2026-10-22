'use client'

import { useRowLabel } from '@payloadcms/ui'

import { BLOCK_ROW_LABELS } from './blockRowLabel'

type RowData = { blockType?: string; [key: string]: unknown }

export function BlockRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>()
  const labelField = data.blockType ? BLOCK_ROW_LABELS[data.blockType] : undefined
  const label = labelField ? (data[labelField] as string | undefined) : undefined

  return <div>{label || `Blok ${(rowNumber ?? 0) + 1}`}</div>
}
