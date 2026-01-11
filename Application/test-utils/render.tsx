import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';

// Match the theme from layout.tsx
const brandColor: MantineColorsTuple = [
  '#ecefff',
  '#d5dafb',
  '#a9b1f1',
  '#7a87e9',
  '#5362e1',
  '#3a4bdd',
  '#2c40dc',
  '#1f32c4',
  '#182cb0',
  '#0a259c'
];

const theme = createTheme({
  colors: {
    brand: brandColor,
  },
  primaryColor: 'brand',
});

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>;

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MantineProvider theme={theme}>{children}</MantineProvider>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
export { default as userEvent } from '@testing-library/user-event';
