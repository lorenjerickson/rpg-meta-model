'use client';

import {
  Button,
  Icon,
  MediaEditor,
  ShapeForm,
  Text,
  isIconName,
  type IconName,
} from '@dnd-domain/ui';
import {
  entryIdFrom,
  validateShape,
  type EntryDetail,
  type MediaView,
  type ShapeError,
} from '@dnd-domain/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppButtonLink } from './AppLink';
import { entryIcon } from './EntryIcon';

type MediaAction = 'upload' | 'generate' | 'remove' | 'icon';

interface ApiError {
  message?: string | string[];
  errors?: ShapeError[];
}

function messageOf(body: ApiError, fallback: string): string {
  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
  return message ?? fallback;
}

/** Problems the API would also find: the inferred shape, plus a name. */
function check(detail: EntryDetail, value: unknown, isNew: boolean): ShapeError[] {
  const errors = validateShape(detail.shape, value);
  const name = (value as { name?: unknown } | null)?.name;
  if (typeof name !== 'string' || !name.trim()) {
    errors.push({ path: ['name'], message: 'is required' });
  } else if (isNew && !entryIdFrom(name)) {
    errors.push({ path: ['name'], message: 'needs a letter or number' });
  }
  return errors;
}

/** A new entry's id follows its name until it is created, and is fixed after that. */
function withId(value: unknown, isNew: boolean): unknown {
  if (!isNew || typeof value !== 'object' || value === null) return value;
  const name = (value as { name?: unknown }).name;
  return { ...value, id: entryIdFrom(typeof name === 'string' ? name : '') };
}

/**
 * Edits one catalog entry: its picture on one side, and on the other a form generated from the
 * entry's inferred shape. A new entry is created on its first save, and gets its picture after.
 */
export function EntryEditor({
  initial,
  isNew = false,
  listHref,
  defaultIcon,
}: {
  initial: EntryDetail;
  /** A blank entry from the catalog's draft, not yet created. */
  isNew?: boolean;
  /** The catalog's list page; entries live under it. */
  listHref: string;
  defaultIcon: IconName;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [value, setValue] = useState<unknown>(initial.entry);
  const [errors, setErrors] = useState<ShapeError[]>([]);
  const [status, setStatus] = useState<{ tone: 'danger' | 'success'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<MediaView>(initial.media);
  const [mediaBusy, setMediaBusy] = useState<MediaAction | null>(null);
  const [mediaError, setMediaError] = useState<string | undefined>(undefined);

  const base = `/api/catalogs/${encodeURIComponent(detail.catalog.key)}/${encodeURIComponent(detail.entry.id)}`;
  const dirty = isNew || JSON.stringify(value) !== JSON.stringify(detail.entry);

  async function send(path: string, init: RequestInit): Promise<{ ok: boolean; body: unknown }> {
    const response = await fetch(`${base}${path}`, init);
    const body = (await response.json().catch(() => ({}))) as unknown;
    return { ok: response.ok, body };
  }

  async function save() {
    const problems = check(detail, value, isNew);
    setErrors(problems);
    if (problems.length) {
      setStatus({
        tone: 'danger',
        text: `${String(problems.length)} problem(s) to fix before saving.`,
      });
      return;
    }
    setSaving(true);
    try {
      const { ok, body } = isNew
        ? await post(`/api/catalogs/${encodeURIComponent(detail.catalog.key)}`, {
            part: detail.part,
            entry: value,
          })
        : await send('', {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ entry: value }),
          });
      if (!ok) {
        const error = body as ApiError;
        setErrors(error.errors ?? []);
        setStatus({ tone: 'danger', text: messageOf(error, 'Saving failed.') });
        return;
      }
      const next = body as EntryDetail;
      if (isNew) {
        // The entry now exists: edit it at its own address.
        router.replace(`${listHref}/${encodeURIComponent(next.entry.id)}`);
        router.refresh();
        return;
      }
      setDetail(next);
      setValue(next.entry);
      setStatus({ tone: 'success', text: 'Saved.' });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function post(url: string, payload: unknown) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as unknown;
    return { ok: response.ok, body };
  }

  async function remove() {
    if (!window.confirm(`Delete ${detail.entry.name}? This can’t be undone.`)) return;
    setSaving(true);
    try {
      const response = await fetch(base, { method: 'DELETE' });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as ApiError;
        setStatus({ tone: 'danger', text: messageOf(body, 'Deleting failed.') });
        return;
      }
      router.replace(listHref);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function revert() {
    setSaving(true);
    try {
      const { ok, body } = await send('/edits', { method: 'DELETE' });
      if (!ok) {
        setStatus({ tone: 'danger', text: messageOf(body as ApiError, 'Reverting failed.') });
        return;
      }
      const next = body as EntryDetail;
      setDetail(next);
      setValue(next.entry);
      setErrors([]);
      setStatus({ tone: 'success', text: 'Back to the original.' });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function changeMedia(action: MediaAction, path: string, init: RequestInit) {
    setMediaBusy(action);
    setMediaError(undefined);
    try {
      const { ok, body } = await send(path, init);
      if (!ok) {
        setMediaError(messageOf(body as ApiError, 'That didn’t work.'));
        return;
      }
      setMedia(body as MediaView);
      router.refresh();
    } catch {
      setMediaError('The catalog service isn’t reachable.');
    } finally {
      setMediaBusy(null);
    }
  }

  const name =
    typeof (value as { name?: unknown }).name === 'string'
      ? (value as { name: string }).name
      : detail.entry.name;

  return (
    <div className="editor">
      <aside className="editor__media">
        {isNew ? (
          <Text muted>{`Create the ${detail.kind} to give it an image or icon.`}</Text>
        ) : (
          <MediaEditor
            name={name}
            imageUrl={media.imageUrl}
            icon={entryIcon(media.icon, defaultIcon)}
            iconChosen={Boolean(media.icon && isIconName(media.icon))}
            defaultPrompt={media.prompt ?? detail.defaultPrompt}
            canGenerate={detail.canGenerate}
            busy={mediaBusy}
            error={mediaError}
            onUpload={(file) => {
              const form = new FormData();
              form.append('file', file);
              void changeMedia('upload', '/image', { method: 'POST', body: form });
            }}
            onGenerate={(prompt) => {
              void changeMedia('generate', '/image/generate', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ prompt }),
              });
            }}
            onRemoveImage={() => {
              void changeMedia('remove', '/image', { method: 'DELETE' });
            }}
            onIconChange={(icon) => {
              void changeMedia('icon', '/icon', {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ icon }),
              });
            }}
          />
        )}
      </aside>
      <section className="editor__form" aria-label={`Edit ${name}`}>
        <div className="editor__bar">
          <div className="editor__status" role="status">
            {status ? (
              <Text tone={status.tone}>{status.text}</Text>
            ) : (
              <Text muted>
                {isNew
                  ? `A new ${detail.kind}, not created yet.`
                  : dirty
                    ? 'Unsaved changes.'
                    : detail.added
                      ? `Added to ${detail.catalog.label.toLowerCase()}.`
                      : detail.edited
                        ? 'Edited from the original.'
                        : 'Original.'}
              </Text>
            )}
          </div>
          <div className="editor__actions">
            {detail.added && !isNew ? (
              <Button disabled={saving} onClick={() => void remove()}>
                <Icon name="trash-2" size={16} />
                Delete
              </Button>
            ) : null}
            {detail.edited ? (
              <Button disabled={saving} onClick={() => void revert()}>
                Revert to original
              </Button>
            ) : null}
            {isNew ? (
              <AppButtonLink href={listHref}>Cancel</AppButtonLink>
            ) : (
              <Button
                disabled={saving || !dirty}
                onClick={() => {
                  setValue(detail.entry);
                  setErrors([]);
                  setStatus(null);
                }}
              >
                Discard changes
              </Button>
            )}
            <Button variant="primary" disabled={saving || !dirty} onClick={() => void save()}>
              {saving ? 'Saving…' : isNew ? `Create ${detail.kind}` : 'Save'}
            </Button>
          </div>
        </div>
        <ShapeForm
          shape={detail.shape}
          value={value}
          onChange={(changed) => {
            const next = withId(changed, isNew);
            setValue(next);
            setStatus(null);
            if (errors.length) setErrors(check(detail, next, isNew));
          }}
          errors={errors}
          disabled={saving}
        />
      </section>
    </div>
  );
}
