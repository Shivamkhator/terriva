'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: 'top' | 'static';
  lableContenPos?: 'left' | 'right';
  label?: React.ReactNode | ((value: number | undefined) => React.ReactNode);
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    {
      className,
      label,
      labelPosition = 'top',
      lableContenPos = 'right',
      ...props
    },
    ref
  ) => {
    const initialValue = Array.isArray(props.value)
      ? props.value
      : [props.min, props.max];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className='relative h-4 w-full grow overflow-hidden bg-white rounded-lg border border-gray-primary/20'>
          <SliderPrimitive.Range
            className="absolute h-full transition-colors"
            style={{
              backgroundColor:
                props.value?.[0] === 0
                  ? "##FFFFFF"
                  : props.value?.[0] === 1
                  ? "#E9D5E1"
                  : props.value?.[0] === 2
                  ? "#FBBBCE"
                  : "#FCA5AC",
            }}
          />
        </SliderPrimitive.Track>
        <>
          {initialValue.map((value, index) => (
            <React.Fragment key={index}>
              <SliderPrimitive.Thumb className='relative grid h-6 w-3 cursor-grab place-content-center bg-white shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white border border-gray-primary/60 rounded-full hover:bg-gray-300'>
                {label && labelPosition !== 'static' && (
                  <div
                    className={cn(
                      'absolute flex w-full justify-center items-start gap-0.5',
                      labelPosition === 'top' && '-top-7',
                    )}
                  >
                    {typeof label === 'function' ? (
                      <span className='inline-block -translate-y-0.5'>
                        {label(value)}
                      </span>
                    ) : (
                      label && (
                        <span className='inline-block'>{label}</span>
                      )
                    )}
                  </div>
                )}
              </SliderPrimitive.Thumb>
            </React.Fragment>
          ))}
        </>

        {label && labelPosition === 'static' && (
          <>
            {initialValue.map((value, index) => (
              <div
                key={index}
                className={cn(
                  'absolute -top-7 w-fit right-0 flex justify-center items-start gap-0.5'
                )}
              >
                {typeof label === 'function' ? (
                  <span className='inline-block -translate-y-0.5'>
                    {label(value)}
                  </span>
                ) : (
                  label && <span className='inline-block'>{label}</span>
                )}
              </div>
            ))}
          </>
        )}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };