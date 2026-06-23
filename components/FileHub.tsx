'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { HubRoute } from '@/components/HubRoute';
import { Illustration } from '@/components/Illustration';
import { StatusSteps } from '@/components/StatusSteps';
import { ToastStack, useToast } from '@/components/Toast';
import { collectDroppedFiles, totalBytes, type StagedFile } from '@/lib/collect-files';
import { MAX_UPLOAD_BYTES } from '@/lib/constants-client';
import { fileExt, formatDate, formatDateFull, formatSize } from '@/lib/format';
import type { FileEntry } from '@/lib/storage';
import { createZip, makeParcelName } from '@/lib/zip-client';

type StorageMode = 'local' | 'blob';
type Phase = 'idle' | 'collecting' | 'packing' | 'uploading';

async function uploadViaForm(file: File, onProgress: (n: number) => void) {
  const form = new FormData();
  form.append('file', file);
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        try {
          reject(new Error(JSON.parse(xhr.responseText).error || '発送に失敗しました'));
        } catch {
          reject(new Error('発送に失敗しました'));
        }
      }
    };
    xhr.onerror = () => reject(new Error('発送に失敗しました'));
    xhr.open('POST', '/api/upload');
    xhr.send(form);
  });
}

async function uploadViaBlob(file: File, onProgress: (n: number) => void) {
  const { upload } = await import('@vercel/blob/client');
  await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    onUploadProgress: ({ percentage }) => onProgress(percentage),
  });
}

export function FileHub() {
  const { toasts, push } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<StorageMode>('local');

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('');
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<StagedFile[]>([]);

  const busy = phase !== 'idle';

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/files', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles(data.files);
      setMode(data.mode === 'blob' ? 'blob' : 'local');
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  async function processUpload(staged: StagedFile[]) {
    if (!staged.length) return;

    const bytes = totalBytes(staged);
    if (bytes > MAX_UPLOAD_BYTES) {
      push(`合計サイズが上限（${formatSize(MAX_UPLOAD_BYTES)}）を超えています`, 'error');
      return;
    }

    setQueue(staged);
    const uploadFn = mode === 'blob' ? uploadViaBlob : uploadViaForm;

    try {
      setPhase('packing');
      setProgress(0);

      const zipBlob = await createZip(staged, (pct, label) => {
        setProgress(Math.round(pct * 0.6));
        setStatusLabel(label);
      });

      if (zipBlob.size > MAX_UPLOAD_BYTES) {
        throw new Error(`発送サイズ（${formatSize(zipBlob.size)}）が上限を超えています`);
      }

      const zipName = makeParcelName();
      const parcel = new File([zipBlob], zipName, { type: 'application/zip' });

      setPhase('uploading');
      setProgress(0);
      setStatusLabel(`輸送中: ${zipName}`);
      await uploadFn(parcel, (n) => setProgress(n));

      push(`${zipName} を出荷登録しました`, 'success');
      await loadFiles();
    } catch (err) {
      push(err instanceof Error ? err.message : '処理に失敗しました', 'error');
    } finally {
      setPhase('idle');
      setProgress(0);
      setStatusLabel('');
      setQueue([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDataTransfer(dt: DataTransfer) {
    if (busy) return;
    try {
      setPhase('collecting');
      setStatusLabel('集荷中...');
      const staged = await collectDroppedFiles(dt);
      if (!staged.length) {
        push('ファイルが見つかりませんでした', 'error');
        setPhase('idle');
        return;
      }
      await processUpload(staged);
    } catch (err) {
      push(err instanceof Error ? err.message : '読み込みに失敗しました', 'error');
      setPhase('idle');
      setStatusLabel('');
      setQueue([]);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    const res = await fetch(`/api/download/${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (res.ok) {
      push('削除しました', 'info');
      loadFiles();
    } else {
      push('削除に失敗しました', 'error');
    }
  }

  const phaseLabel =
    phase === 'collecting' ? '集荷処理中' :
    phase === 'packing' ? '梱包中' :
    phase === 'uploading' ? '幹線輸送中' : '';

  const phaseForSteps = phase === 'idle' ? 'idle' : phase;

  return (
    <div className="hub">
      <section className="hero illus-wrap anim anim--1">
        <div className="hero__text">
          <span className="pill anim-pill">拠点間ルート · HUB-A → HUB-B</span>
          <h1>拠点間ファイル配送</h1>
          <p>出荷拠点から受取拠点へファイルを輸送。梱包から幹線輸送まで自動処理します。</p>
          <HubRoute active={busy} />
        </div>
        <Illustration name="hero" className="hero__illus" priority />
      </section>

      <div className="tls-notice anim anim--2">
        <span className="tls-notice__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="tls-notice__title">通信は TLS 証明書（HTTPS）で保護</p>
          <p className="tls-notice__desc">転送中のデータは暗号化されます。アクセスはログインパスワードで管理。</p>
        </div>
      </div>

      <section className="ship-card anim anim--3">
        <div className="ship-card__head">
          <div>
            <h2>出荷拠点 · HUB-A</h2>
            <p className="ship-card__sub">集荷 → 梱包 → 幹線輸送（HUB-B へ）</p>
          </div>
          <span className="pill pill--amber">上限 {formatSize(MAX_UPLOAD_BYTES)}</span>
        </div>

        {busy && <StatusSteps phase={phaseForSteps} />}

        <div
          className={`drop-port illus-wrap${dragging ? ' drop-port--active' : ''}${busy ? ' drop-port--busy' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && !busy && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleDataTransfer(e.dataTransfer);
          }}
        >
          <Illustration name="upload" className="drop-port__illus" />
          <p className="drop-port__title">
            {busy ? phaseLabel : '集荷バースにファイルを配置'}
          </p>
          <p className="drop-port__hint">
            {busy ? statusLabel : 'フォルダ一括OK · クリックでファイル選択'}
          </p>

          {busy && (
            <div className="progress-track">
              <div className="progress-track__bar">
                <div className="progress-track__fill progress-track__fill--active" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-track__label">{progress}%</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            hidden
            multiple
            onChange={(e) => {
              if (busy) return;
              const list = e.target.files;
              if (!list?.length) return;
              processUpload(Array.from(list).map((file) => ({ file, path: file.name })));
            }}
          />
        </div>

        {queue.length > 0 && busy && (
          <ul className="queue">
            {queue.slice(0, 4).map((item) => <li key={item.path}>{item.path}</li>)}
            {queue.length > 4 && <li>…ほか {queue.length - 4} 件</li>}
          </ul>
        )}
      </section>

      <section className="ship-card anim anim--4">
        <div className="ship-card__head">
          <div>
            <h2>受取拠点 · HUB-B</h2>
            <p className="ship-card__sub">{files.length > 0 ? `${files.length} 件 入庫済` : '入庫待ち'}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={loadFiles} disabled={loading || busy}>
            更新
          </button>
        </div>

        <div className="parcel-list">
          {loading && (
            <div className="parcel-empty">
              <div className="skeleton skeleton--row" />
              <div className="skeleton skeleton--row" />
            </div>
          )}
          {error && <div className="parcel-empty parcel-empty--error">{error}</div>}
          {!loading && !error && files.length === 0 && (
            <div className="parcel-empty illus-wrap">
              <Illustration name="empty" className="parcel-empty__illus" />
              <p className="parcel-empty__title">入庫データはありません</p>
              <p className="parcel-empty__desc">HUB-A から出荷されると、ここに表示されます。</p>
            </div>
          )}
          {!loading && files.length > 0 && (
            <ul className="parcels">
              {files.map((f, i) => (
                <li key={f.name} className="parcel-item anim-stagger" style={{ '--i': i } as CSSProperties}>
                  <div className="parcel-item__mark">{fileExt(f.name)}</div>
                  <div className="parcel-item__info">
                    <div className="parcel-item__row">
                      <div className="parcel-item__name" title={f.name}>{f.name}</div>
                      <span className="tracking-badge">入庫済</span>
                    </div>
                    <div className="parcel-item__meta" title={formatDateFull(f.uploadedAt)}>
                      {formatSize(f.size)} · {formatDate(f.uploadedAt)}
                    </div>
                  </div>
                  <div className="parcel-item__actions">
                    <a
                      href={`/api/download/${encodeURIComponent(f.name)}`}
                      className="btn btn-accent btn-sm"
                      download
                    >
                      受け取り
                    </a>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDelete(f.name)}
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ToastStack toasts={toasts} />
      <p className="illus-credit">
        Illustrations by{' '}
        <a href="https://undraw.co" target="_blank" rel="noopener noreferrer">
          unDraw
        </a>
      </p>
    </div>
  );
}
