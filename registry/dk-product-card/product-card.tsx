import type { ReactNode } from 'react'

export interface DKProductCardProps {
  /** Product name, set in a medium weight above the description. */
  title?: string
  /** One-line supporting copy, muted. */
  description?: string
  /** Where the card links. Omit it (and asin) for a card that is not clickable. */
  href?: string
  /** Amazon ASIN. Builds the href (amazon.com/dp/ASIN) and switches the label to "Amazon". */
  asin?: string
  /** Link label. Defaults to "Amazon" for Amazon links, "View" otherwise. */
  label?: string
  /** Product image URL, rendered in a fixed square slot on the left. */
  image?: string
  /** Alt text for the product image. Falls back to the title. */
  imageAlt?: string
  /** Sugar for strip="Retired". */
  retired?: boolean
  /** Status-strip text across the top of the card, e.g. "Retired" or "Updated". */
  strip?: string
  /** Rich body content for note-style cards (a strip plus a sentence, no image or title).
   *  Markdown links inside survive from MDX and pick up the accent treatment. */
  children?: ReactNode
  /** Render the product image yourself (e.g. with next/image). Apply ctx.className
   *  and ctx.alt to the element you return. */
  renderImage?: (src: string, ctx: { alt: string; className: string }) => ReactNode
}

export function DKProductCard({
  title,
  description,
  href,
  asin,
  label,
  image,
  imageAlt,
  retired,
  strip,
  children,
  renderImage,
}: DKProductCardProps) {
  const url = href ?? (asin ? `https://www.amazon.com/dp/${asin}` : undefined)
  const isAmazon = !!asin || (url?.includes('amazon.com') ?? false)
  const displayLabel = label ?? (isAmazon ? 'Amazon' : 'View')

  /* Some products cannot be linked (discontinued, page gone). A card with a dead
     "View" pointing at "#" is worse than a card that simply does not claim to be
     clickable, so with no href and no asin this renders as a plain div: no link,
     no label, none of the hover affordances that would promise one. */
  const Shell = url ? 'a' : 'div'
  const shellProps = url ? { href: url, target: '_blank', rel: 'noopener noreferrer' } : {}

  const stripText = strip ?? (retired ? 'Retired' : null)
  const isNote = !image && !title && !!children
  const alt = imageAlt ?? title ?? ''

  return (
    <div className="dkpc-scope dkpc-root">
      <Shell {...shellProps} className={`dkpc-card${url ? ' dkpc-linked' : ''}`}>
        {/* The state belongs to the whole card, not to the title, so it reads better
            as a band across the top than as a pill floating inside the content. */}
        {stripText && <div className="dkpc-strip">{stripText}</div>}
        {/* Note-style cards tuck the body under the strip with matching padding, so
            the sentence left-aligns with the strip label. Product cards keep the
            roomier frame. */}
        <div className={`dkpc-row${isNote ? ' dkpc-row-note' : ''}`}>
          {image && (
            <div className="dkpc-image-slot">
              {renderImage ? (
                renderImage(image, { alt, className: 'dkpc-image' })
              ) : (
                <img src={image} alt={alt} className="dkpc-image" loading="lazy" />
              )}
            </div>
          )}
          <div>
            {title && <p className="dkpc-title">{title}</p>}
            {children && <div className="dkpc-body">{children}</div>}
            {description && <p className="dkpc-desc">{description}</p>}
            {url && (
              <p className="dkpc-label">
                <span className="dkpc-label-text">{displayLabel}</span>
              </p>
            )}
          </div>
        </div>
      </Shell>
    </div>
  )
}
