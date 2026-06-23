'use client';

import { ReceiveStation } from '@/vault/components/receive-station';
import { SendStation } from '@/vault/components/send-station';
import { MAX_UPLOAD_BYTES } from '@/lib/constants-client';
import { formatSize } from '@/lib/format';
import type { StagedFile } from '@/lib/collect-files';
import type { FileEntry } from '@/lib/storage';
import type { VaultPhase } from '@/vault/hooks/use-vault';

type Props = {
  phase: VaultPhase;
  progress: number;
  statusLabel: string;
  busy: boolean;
  files: FileEntry[];
  loading: boolean;
  error: string;
  onUpload: (staged: StagedFile[], password: string) => void;
  onRefresh: () => void;
  onRemove: (name: string) => void;
};

export function DeliveryHub(props: Props) {
  const { files, loading } = props;

  return (
    <div className="vault-panel">
      <div className="relative flex items-center justify-between border-b border-border/60 px-6 py-4">
        <h1 className="text-base font-semibold text-foreground">ファイル転送</h1>
        <p className="text-xs text-muted-foreground">
          上限 {formatSize(MAX_UPLOAD_BYTES)}
          {!loading && <> · {files.length} 件</>}
        </p>
      </div>

      <SendStation
        phase={props.phase}
        progress={props.progress}
        statusLabel={props.statusLabel}
        busy={props.busy}
        onUpload={props.onUpload}
      />
      <ReceiveStation
        files={props.files}
        loading={props.loading}
        error={props.error}
        busy={props.busy}
        onRefresh={props.onRefresh}
        onRemove={props.onRemove}
      />
    </div>
  );
}
