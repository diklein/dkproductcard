/**
 * remark plugin: rewrites bare Amazon product URLs (a paragraph that is nothing
 * but the URL) into a product-card JSX flow element:
 *
 *   https://www.amazon.com/dp/B0ABCDEFGH
 *     ↓
 *   <DKProductCard asin="B0ABCDEFGH" />
 *
 * Only block-level paragraphs whose sole child is a single Amazon URL are
 * rewritten. Inline Amazon URLs inside a paragraph of other text are left
 * untouched, as are autolinks the author wrapped in markdown link syntax.
 */

import { visit, SKIP } from 'unist-util-visit'

// Amazon product URLs with /dp/ or /gp/product/ paths, any marketplace TLD.
// Captures the 10-character ASIN (uppercase alphanumeric).
const AMAZON_RE = /^https?:\/\/(?:www\.)?amazon\.[a-z.]+\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i

/**
 * @param {Object} [options]
 * @param {string} [options.component='DKProductCard'] JSX element name to emit.
 *   Point it at whatever your MDX components mapping calls the card.
 */
export default function remarkAmazonProduct(options = {}) {
  const { component = 'DKProductCard' } = options

  return function transformer(tree) {
    visit(tree, 'paragraph', (paragraphNode, index, parent) => {
      if (
        paragraphNode.children.length !== 1 ||
        paragraphNode.children[0].type !== 'text'
      ) {
        return
      }

      const text = paragraphNode.children[0].value.trim()
      const match = AMAZON_RE.exec(text)
      if (!match) return

      const jsxNode = {
        type: 'mdxJsxFlowElement',
        name: component,
        attributes: [
          { type: 'mdxJsxAttribute', name: 'asin', value: match[1] },
        ],
        children: [],
      }

      parent.children.splice(index, 1, jsxNode)

      // SKIP at the same index: don't recurse into the new node, don't skip
      // past whatever slid into this slot.
      return [SKIP, index]
    })
  }
}
