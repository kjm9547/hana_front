import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

import { cn } from '@/lib/utils';
import { TextClassContext } from '@/ui/text';

// Reusables의 Button을 Hana에 맞춘 것: 그림자 없이 평평하게, 모서리 14, 높이 56 / 44 두 가지.
const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md',
    Platform.select({
      web: 'outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none',
    }),
  ),
  {
    variants: {
      variant: {
        default: cn('bg-primary active:bg-primary-strong', Platform.select({ web: 'hover:bg-primary-strong' })),
        /** 색 면 위의 흰 버튼 */
        onField: cn('bg-white active:bg-grey-100', Platform.select({ web: 'hover:bg-grey-100' })),
        secondary: cn('bg-secondary active:bg-grey-200', Platform.select({ web: 'hover:bg-grey-200' })),
        outline: cn('border border-border bg-background active:bg-accent', Platform.select({ web: 'hover:bg-accent' })),
        ghost: cn('active:bg-accent', Platform.select({ web: 'hover:bg-accent' })),
        destructive: cn('bg-destructive active:bg-destructive/90', Platform.select({ web: 'hover:bg-destructive/90' })),
      },
      size: {
        /** 화면 하단 CTA */
        lg: 'h-14 px-5',
        /** 본문 안 버튼 */
        default: 'h-11 px-4',
        icon: 'size-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const buttonTextVariants = cva('font-bold text-body text-foreground', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      onField: 'text-primary-strong',
      secondary: 'text-secondary-foreground',
      outline: '',
      ghost: 'font-semibold text-grey-700',
      destructive: 'text-white',
    },
    disabled: { true: 'text-grey-500' },
  },
  defaultVariants: { variant: 'default' },
});

type ButtonProps = React.ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

/** 안에 <Text>를 넣으면 글자 스타일이 자동으로 맞춰진다. 비활성은 회색 면 + 회색 글자. */
function Button({ className, variant, size, ...props }: ButtonProps) {
  const disabled = !!props.disabled;
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, disabled })}>
      <Pressable
        className={cn(buttonVariants({ variant, size }), disabled && variant !== 'ghost' && 'bg-grey-100', className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
