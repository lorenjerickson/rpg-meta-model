import { useRef, useState } from 'react';
import { Button } from './Button';
import { FilterInput, NoMatches, matchesQuery } from './Filter';
import { ICON_GROUPS, Icon, type IconName } from './Icon';
import { Textarea } from './Input';
import { cx } from './internal';

export interface MediaEditorProps {
  /** What the image is of, for alt text and labels. */
  name: string;
  /** URL of the current image, if there is one. */
  imageUrl?: string | undefined;
  /** The icon shown when there is no image. */
  icon: IconName;
  /** Whether `icon` was chosen for this item, rather than a default. */
  iconChosen?: boolean;
  /** The prompt the Generate field starts with. */
  defaultPrompt: string;
  /** Whether an image generator is configured. */
  canGenerate: boolean;
  /** Which action is in progress, if any. */
  busy?: 'upload' | 'generate' | 'remove' | 'icon' | null;
  error?: string | undefined;
  onUpload: (file: File) => void;
  onGenerate: (prompt: string) => void;
  onRemoveImage: () => void;
  /** Called with null to go back to the default icon. */
  onIconChange: (icon: IconName | null) => void;
  className?: string;
}

/**
 * The picture for an item: a preview, upload and generate actions, and an icon picker for when
 * there is no image.
 */
export function MediaEditor({
  name,
  imageUrl,
  icon,
  iconChosen = false,
  defaultPrompt,
  canGenerate,
  busy = null,
  error,
  onUpload,
  onGenerate,
  onRemoveImage,
  onIconChange,
  className,
}: MediaEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [iconQuery, setIconQuery] = useState('');
  const iconGroups = Object.entries(ICON_GROUPS).filter(([group]) => group !== 'Interface');
  const allIcons = iconGroups.flatMap(([, icons]) => Object.keys(icons) as IconName[]);
  // Icons match on their name and their group ("creatures", "weapons").
  const shownIcons = iconGroups.flatMap(([group, icons]) =>
    (Object.keys(icons) as IconName[]).filter((option) =>
      matchesQuery(`${option.replace(/-/g, ' ')} ${group}`, iconQuery),
    ),
  );
  const working = busy !== null;

  return (
    <div className={cx('ds-media', className)}>
      <div className="ds-media__preview">
        {imageUrl ? (
          <img className="ds-media__image" src={imageUrl} alt={name} />
        ) : (
          <Icon name={icon} size={64} label={`${name} icon`} />
        )}
      </div>

      <div className="ds-media__actions">
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="ds-sr"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = '';
          }}
        />
        <Button
          disabled={working}
          onClick={() => {
            fileInput.current?.click();
          }}
        >
          {busy === 'upload' ? 'Uploading…' : 'Upload image'}
        </Button>
        {imageUrl ? (
          <Button disabled={working} onClick={onRemoveImage}>
            {busy === 'remove' ? 'Removing…' : 'Remove image'}
          </Button>
        ) : null}
      </div>

      <div className="ds-media__generate">
        <Textarea
          label="Generate an image"
          hint={
            canGenerate
              ? 'Describe the picture; the period and art style are added for you.'
              : 'Image generation is not configured. Set OPENAI_API_KEY for the API.'
          }
          rows={3}
          value={prompt}
          disabled={working || !canGenerate}
          onChange={(event) => {
            setPrompt(event.target.value);
          }}
        />
        <Button
          variant="secondary"
          disabled={working || !canGenerate || !prompt.trim()}
          onClick={() => {
            onGenerate(prompt.trim());
          }}
        >
          {busy === 'generate' ? 'Generating…' : 'Generate'}
        </Button>
      </div>

      {error ? (
        <div className="ds-hint ds-hint--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="ds-media__icons">
        <div className="ds-media__icons-head">
          <span className="ds-label">Icon</span>
          {iconChosen ? (
            <Button
              size="sm"
              disabled={working}
              onClick={() => {
                onIconChange(null);
              }}
            >
              Use default
            </Button>
          ) : null}
        </div>
        <FilterInput
          query={iconQuery}
          onQueryChange={setIconQuery}
          shown={shownIcons.length}
          total={allIcons.length}
          noun="icons"
        />
        {shownIcons.length ? null : <NoMatches query={iconQuery} />}
        <div className="ds-media__icon-grid" role="group" aria-label="Choose an icon">
          {shownIcons.map((option) => (
            <button
              key={option}
              type="button"
              className={cx('ds-media__icon', option === icon && 'is-selected')}
              aria-pressed={option === icon}
              aria-label={option.replace(/-/g, ' ')}
              title={option.replace(/-/g, ' ')}
              disabled={working}
              onClick={() => {
                onIconChange(option);
              }}
            >
              <Icon name={option} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
