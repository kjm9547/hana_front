import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

import { cn } from '@/lib/utils';
import { TextClassContext } from '@/ui/text';

// Reusables의 Button을 Hana에 맞춘 것: 그림자 없이 평평하게, 모서리 12, 크기 3단계.
const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-lg',
    Platform.select({
      web: 'outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none',
    }),
  ),
  {
    variants: {
      variant: {
        default: cn('bg-primary active:bg-primary/90', Platform.select({ web: 'hover:bg-primary/90' })),
        secondary: cn('bg-secondary active:bg-grey-200', Platform.select({ web: 'hover:bg-grey-200' })),
        outline: cn('border border-border bg-background active:bg-accent', Platform.select({ web: 'hover:bg-accent' })),
        ghost: cn('active:bg-accent', Platform.select({ web: 'hover:bg-accent' })),
        destructive: cn('bg-destructive active:bg-destructive/90', Platform.select({ web: 'hover:bg-destructive/90' })),
      },
      size: {
        /** 화면 하단 CTA */
        lg: 'h-14 px-6',
        /** 본문 안 버튼 */
        default: 'h-11 px-4',
        /** 작은 보조 버튼 */
        sm: 'h-8 px-3',
        icon: 'size-12',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const buttonTextVariants = cva('font-semibold text-sub text-foreground', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: '',
      ghost: 'font-medium text-muted-foreground',
      destructive: 'text-white',
    },
    size: { lg: 'text-body', default: '', sm: '', icon: '' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

type ButtonProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

/** 안에 <Text>를 넣으면 글자 스타일이 자동으로 맞춰진다 */
function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }), props.disabled && 'opacity-40', className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
