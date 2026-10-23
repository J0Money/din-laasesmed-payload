type LexicalNode = { type?: string; text?: string; children?: LexicalNode[] }

function textOf(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(textOf).join('')
}

/** Første afsnit som ren tekst; originalens kort skjuler overskrifter og viser kun første <p>. */
export function firstParagraphText(data: unknown): string {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root
  const paragraph = root?.children?.find((node) => node.type === 'paragraph' && textOf(node).trim())
  return paragraph ? textOf(paragraph).trim() : ''
}
