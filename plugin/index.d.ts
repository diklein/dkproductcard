import type { Plugin } from 'unified'
import type { Root } from 'mdast'

export interface RemarkAmazonProductOptions {
  /** JSX element name to emit. Defaults to 'DKProductCard'. */
  component?: string
}

declare const remarkAmazonProduct: Plugin<[RemarkAmazonProductOptions?], Root>
export default remarkAmazonProduct
