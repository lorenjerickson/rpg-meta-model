import type { CSSProperties, ElementType, MouseEvent, ReactNode } from 'react';
import { cx } from './internal';

export interface CardProps {
  /** Image URL (or a node) shown full-bleed at the top. */
  image?: string | ReactNode;
  imageAlt?: string;
  /** CSS aspect ratio of the image area. Default "16 / 9". */
  imageRatio?: string;
  /** Small purple-400 overline above the title (a category or tag). */
  eyebrow?: ReactNode;
  /** Card heading, 18px bold ink. */
  title?: ReactNode;
  /** Supporting content under the title, grey-400. */
  children?: ReactNode;
  /** Optional row of Buttons at the bottom. */
  actions?: ReactNode;
  /** Makes the whole card clickable; hover lifts it to elevation-3. */
  onClick?: (event: MouseEvent) => void;
  /** Element to render. Default "article". */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** A vertical container: image, title, supporting content, optional actions, at elevation-2. */
export function Card({
  image,
  imageAlt,
  imageRatio = '16 / 9',
  eyebrow,
  title,
  children,
  actions,
  onClick,
  as: Tag = 'article',
  className,
  style,
}: CardProps) {
  let media: ReactNode = null;
  if (image) {
    media =
      typeof image === 'string' ? (
        <img
          className="ds-card__media"
          src={image}
          alt={imageAlt ?? ''}
          style={{ aspectRatio: imageRatio }}
        />
      ) : (
        <div className="ds-card__media" style={{ aspectRatio: imageRatio }}>
          {image}
        </div>
      );
  }
  return (
    <Tag
      className={cx('ds-card', onClick && 'ds-card--interactive', className)}
      onClick={onClick}
      style={style}
    >
      {media}
      <div className="ds-card__body">
        {eyebrow ? <div className="ds-card__eyebrow">{eyebrow}</div> : null}
        {title ? <h3 className="ds-card__title">{title}</h3> : null}
        {children ? <div className="ds-card__content">{children}</div> : null}
      </div>
      {actions ? <div className="ds-card__actions">{actions}</div> : null}
    </Tag>
  );
}
