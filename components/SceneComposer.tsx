import Image from 'next/image';
import type { CSSProperties } from 'react';

/** unDraw (https://undraw.co) · MIT — balazser/undraw-svg-collection */
const PARTS = {
  folder: { src: '/illustrations/parts/folder.svg', width: 100, height: 80 },
  upload: { src: '/illustrations/parts/upload.svg', width: 110, height: 88 },
  cloud: { src: '/illustrations/parts/cloud-hosting.svg', width: 120, height: 96 },
  bundle: { src: '/illustrations/parts/file-bundle.svg', width: 100, height: 80 },
  transfer: { src: '/illustrations/parts/transfer-files.svg', width: 130, height: 100 },
  server: { src: '/illustrations/parts/server-cluster.svg', width: 110, height: 88 },
  truck: { src: '/illustrations/delivery-truck.svg', width: 160, height: 120 },
  delivered: { src: '/illustrations/order-delivered.svg', width: 140, height: 110 },
} as const;

type PartKey = keyof typeof PARTS;
type SceneVariant = 'hero' | 'drop' | 'empty' | 'login';

type ScenePart = {
  part: PartKey;
  pos: string;
  delay?: number;
  size?: number;
};

const SCENES: Record<SceneVariant, ScenePart[]> = {
  hero: [
    { part: 'folder', pos: 'scene__pos--tl', delay: 0 },
    { part: 'cloud', pos: 'scene__pos--tr', delay: 1 },
    { part: 'upload', pos: 'scene__pos--ml', delay: 2 },
    { part: 'transfer', pos: 'scene__pos--mc', delay: 3 },
    { part: 'truck', pos: 'scene__pos--bc', delay: 1, size: 1.15 },
    { part: 'server', pos: 'scene__pos--br', delay: 2 },
  ],
  drop: [
    { part: 'folder', pos: 'scene__pos--drop-l', delay: 0, size: 0.72 },
    { part: 'upload', pos: 'scene__pos--drop-c', delay: 1, size: 0.95 },
    { part: 'bundle', pos: 'scene__pos--drop-r', delay: 2, size: 0.78 },
  ],
  empty: [
    { part: 'server', pos: 'scene__pos--empty-l', delay: 0, size: 0.82 },
    { part: 'delivered', pos: 'scene__pos--empty-r', delay: 1, size: 0.88 },
  ],
  login: [
    { part: 'cloud', pos: 'scene__pos--login-tl', delay: 0 },
    { part: 'transfer', pos: 'scene__pos--login-c', delay: 1, size: 1.2 },
    { part: 'server', pos: 'scene__pos--login-br', delay: 2 },
  ],
};

export function SceneComposer({
  variant,
  active,
  priority,
}: {
  variant: SceneVariant;
  active?: boolean;
  priority?: boolean;
}) {
  const parts = SCENES[variant];

  return (
    <div
      className={`scene scene--${variant}${active ? ' scene--active' : ''}`}
      aria-hidden="true"
    >
      <svg className="scene__links" viewBox="0 0 320 240" preserveAspectRatio="none">
        <path className="scene__link" d="M 48,72 Q 160,48 272,72" />
        <path className="scene__link" d="M 80,160 Q 160,120 240,160" />
      </svg>

      <span className="scene__orb scene__orb--1" />
      <span className="scene__orb scene__orb--2" />

      {parts.map(({ part, pos, delay = 0, size = 1 }) => {
        const item = PARTS[part];
        return (
          <div
            key={`${variant}-${part}`}
            className={`scene__part ${pos}`}
            style={{
              '--scene-delay': `${delay * 0.12}s`,
              '--scene-scale': size,
            } as CSSProperties}
          >
            <Image
              src={item.src}
              alt=""
              width={Math.round(item.width * size)}
              height={Math.round(item.height * size)}
              className="scene__img"
              priority={priority && part === 'transfer'}
            />
          </div>
        );
      })}

      <span className="scene__dot scene__dot--a" />
      <span className="scene__dot scene__dot--b" />
      <span className="scene__dot scene__dot--c" />
    </div>
  );
}
