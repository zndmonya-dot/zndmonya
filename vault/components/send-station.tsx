'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  browseFiles,
  browseFolder,
  collectDroppedFiles,
  collectSelectedDirectory,
  collectSelectedFiles,
  type StagedFile,
} from '@/lib/collect-files';
import { MAX_UPLOAD_BYTES } from '@/lib/constants-client';
import { formatSize } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ZipPasswordDialog } from '@/vault/components/zip-password-dialog';
import { PHASE_LABEL, type VaultPhase } from '@/vault/hooks/use-vault';

type Props = {
  phase: VaultPhase;
  progress: number;
  statusLabel: string;
  busy: boolean;
  onUpload: (staged: StagedFile[], password: string) => void;
};

export function SendStation({ phase, progress, statusLabel, busy, onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const pickerDialogRef = useRef<HTMLDialogElement>(null);
  const skipClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState<StagedFile[]>([]);
  const [collecting, setCollecting] = useState(false);

  async function openDialogWith(staged: StagedFile[]) {
    if (!staged.length) {
      toast.error('中身が空です');
      return;
    }
    setPending(staged);
    setDialogOpen(true);
  }

  function closePicker() {
    pickerDialogRef.current?.close();
  }

  function openPicker() {
    if (busy || collecting) return;
    pickerDialogRef.current?.showModal();
  }

  async function pickFiles() {
    closePicker();
    if (busy || collecting) return;

    if (typeof window.showOpenFilePicker === 'function') {
      setCollecting(true);
      try {
        const staged = await browseFiles();
        if (staged.length) await openDialogWith(staged);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        setCollecting(false);
      }
      return;
    }

    fileInputRef.current?.click();
  }

  async function pickFolder() {
    closePicker();
    if (busy || collecting) return;

    if (typeof window.showDirectoryPicker === 'function') {
      setCollecting(true);
      try {
        const staged = await browseFolder();
        if (staged.length) await openDialogWith(staged);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '読み込みに失敗しました');
      } finally {
        setCollecting(false);
      }
      return;
    }

    folderInputRef.current?.click();
  }

  async function handleDrop(dt: DataTransfer) {
    if (busy || collecting) return;
    skipClickRef.current = true;
    setCollecting(true);
    try {
      const staged = await collectDroppedFiles(dt);
      await openDialogWith(staged);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setCollecting(false);
    }
  }

  function handleZoneClick() {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    openPicker();
  }

  function handleConfirm(password: string) {
    setDialogOpen(false);
    onUpload(pending, password);
    setPending([]);
  }

  function handleCancel() {
    setDialogOpen(false);
    setPending([]);
  }

  return (
    <>
      <section className="border-b border-border/60 p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">アップロード</h2>

        {busy ? (
          <div
            className="vault-dropzone flex min-h-[168px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 px-6 py-10 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">{PHASE_LABEL[phase]}…</p>
            {statusLabel && (
              <p className="mt-1 max-w-full truncate text-xs text-muted-foreground">{statusLabel}</p>
            )}
            <div className="mt-5 w-full max-w-xs">
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-xs tabular-nums text-muted-foreground">{progress}%</p>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={() => !collecting && handleZoneClick()}
            onKeyDown={(e) => e.key === 'Enter' && !collecting && handleZoneClick()}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleDrop(e.dataTransfer);
            }}
            className={cn(
              'vault-dropzone flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
              collecting ? 'pointer-events-none opacity-60' : '',
              dragging
                ? 'border-primary bg-primary/8 scale-[1.01]'
                : 'border-border/80 bg-muted/30 hover:border-primary/40 hover:bg-primary/5',
            )}
          >
            <div
              className={cn(
                'flex size-14 items-center justify-center rounded-2xl transition-colors',
                dragging ? 'bg-primary text-primary-foreground' : 'bg-background text-primary shadow-sm ring-1 ring-border/60',
              )}
            >
              <Upload className="size-6" strokeWidth={1.5} aria-hidden />
            </div>
            <p className="mt-5 text-sm font-medium text-foreground">
              {collecting ? '読み込み中…' : dragging ? 'ドロップ' : 'クリックまたはドロップ'}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              ZIP にまとめて送信 · {formatSize(MAX_UPLOAD_BYTES)} まで
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          disabled={busy || collecting}
          onChange={(e) => {
            const list = e.target.files;
            if (list?.length) openDialogWith(collectSelectedFiles(list));
            e.target.value = '';
          }}
        />
        <input
          ref={folderInputRef}
          type="file"
          hidden
          // @ts-expect-error non-standard directory picker attributes
          webkitdirectory=""
          directory=""
          multiple
          disabled={busy || collecting}
          onChange={(e) => {
            const list = e.target.files;
            if (list?.length) openDialogWith(collectSelectedDirectory(list));
            e.target.value = '';
          }}
        />
      </section>

      <dialog
        ref={pickerDialogRef}
        className="fixed top-1/2 left-1/2 w-[min(100%,16rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-4 shadow-xl backdrop:bg-foreground/20 open:flex open:flex-col open:gap-3"
      >
        <p className="text-sm font-medium text-foreground">追加するものを選んでください</p>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="secondary" size="sm" className="w-full justify-center" onClick={pickFiles}>
            ファイル
          </Button>
          <Button type="button" variant="secondary" size="sm" className="w-full justify-center" onClick={pickFolder}>
            フォルダ
          </Button>
        </div>
        <Button type="button" variant="ghost" size="sm" className="w-full" onClick={closePicker}>
          キャンセル
        </Button>
      </dialog>

      <ZipPasswordDialog
        open={dialogOpen}
        files={pending}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
