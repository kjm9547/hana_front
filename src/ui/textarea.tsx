import { Platform, TextInput } from 'react-native';

import { cn } from '@/lib/utils';

// Reusables의 Textarea를 Hana Input과 같은 모양으로 맞춘 것
function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 4, native: 8 }), // 웹은 처음 높이, 앱은 최대 높이
  ...props
}: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn(
        'min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 font-normal text-body text-foreground',
        'focus:border-primary',
        props.editable === false && 'opacity-50',
        Platform.select({ web: 'resize-none outline-none' }),
        className,
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };
