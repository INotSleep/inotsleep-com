import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { startBackground } from './background.js';
import './index.css'
import { theme } from './theme.js';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('animated-background');

    const S = {
        "mode": 1,
        "grid": 10,
        "speed": 0.1,
        "contrast": 0.2,
        "pow": 0.1,
        "colA": [
            0,
            0,
            0
        ],
        "colB": [
            0,
            1,
            0.7490196078431373
        ],
        "seed": 0
    };

    startBackground(canvas, S);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
