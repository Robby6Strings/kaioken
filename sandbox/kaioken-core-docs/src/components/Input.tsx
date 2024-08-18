import { useRef, useState, ElementProps } from 'kaioken';
import { twMerge } from 'tailwind-merge';

type InputProps<T extends string | number | undefined> = {
  className?: string,
  value?: T,
  type?: ElementProps<'input'>['type'],
  oninput?: ElementProps<'input'>['oninput'],
  onfocus?: ElementProps<'input'>['onfocus'],
  ref?: ElementProps<'input'>['ref'],
  min?: ElementProps<'input'>['min'],
  max?: ElementProps<'input'>['max'],
  pattern?: ElementProps<'input'>['pattern'],
  inputmode?: ElementProps<'input'>['inputmode'],
  placeholder?: string
}

export const Input = <T extends string | number | undefined, >(props: InputProps<T>) => {
  const divRef = useRef<HTMLInputElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove: ElementProps<'input'>['onmousemove'] = (e) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus: ElementProps<'input'>['onfocus'] = (e) => {
    props?.onfocus?.(e)
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <>
      <div className={twMerge('relative w-full', props.className)}>
        <input
          ref={props.ref}
          onmousemove={handleMouseMove}
          onfocus={handleFocus}
          onblur={handleBlur}
          onmouseenter={handleMouseEnter}
          onmouseleave={handleMouseLeave}
          autocomplete='off'
          placeholder={props.placeholder ?? undefined}
          type={props.type}
          value={props.value ?? ''}
          oninput={props.oninput}
          min={props.min}
          max={props.max}
          pattern={props.pattern}
          inputmode={props.inputmode}
          className='h-12 w-full cursor-default rounded-md border border-gray-800 bg-[#121212] p-3.5 text-gray-100 transition-colors duration-500 placeholder:select-none placeholder:text-gray-500 focus:border-red focus:outline-none'
        />
        <input
          ref={divRef}
          disabled
          style={{
            border: '1px solid #ea495e',
            opacity: `${opacity}`,
            maskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
          }}
          aria-hidden='true'
          className='pointer-events-none absolute left-0 top-0 z-10 h-12 w-full cursor-default rounded-md border border-red bg-[transparent] p-3.5 opacity-0 transition-opacity duration-500 placeholder:select-none'
        />
      </div>
    </>
  );
};
