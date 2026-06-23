import Image from 'next/image';

/** unDraw (https://undraw.co) · MIT — via balazser/undraw-svg-collection */
const ILLUSTRATIONS = {
  hero: {
    src: '/illustrations/delivery-truck.svg',
    width: 640,
    height: 480,
    alt: '配送トラックのイラスト',
    credit: 'Delivery Truck',
  },
  upload: {
    src: '/illustrations/files-sent.svg',
    width: 400,
    height: 320,
    alt: '',
    credit: 'Files Sent',
  },
  empty: {
    src: '/illustrations/order-delivered.svg',
    width: 400,
    height: 320,
    alt: '',
    credit: 'Order Delivered',
  },
} as const;

type IllustrationName = keyof typeof ILLUSTRATIONS;

export function Illustration({
  name,
  className,
  priority,
}: {
  name: IllustrationName;
  className?: string;
  priority?: boolean;
}) {
  const item = ILLUSTRATIONS[name];
  return (
    <Image
      src={item.src}
      alt={item.alt}
      width={item.width}
      height={item.height}
      className={className}
      priority={priority}
    />
  );
}

export const ILLUSTRATION_CREDIT = 'Illustrations by unDraw (undraw.co)';
