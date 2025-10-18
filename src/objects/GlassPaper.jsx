import { Paper } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

export const GlassPaper = styled(Paper, {
    shouldForwardProp: (prop) =>
        !['radius', 'blur', 'paddingVar', 'maxWidthVar', 'baseBg', 'textColor'].includes(prop),
})(({ radius = 24, blur = 5, paddingVar, maxWidthVar, baseBg, textColor }) => {
    const fallbackBg = alpha('#0b1720', 0.60);

    return {
        '--card-radius': `${radius}px`,
        '--card-blur': `${blur}px`,
        '--card-padding': paddingVar ?? 'clamp(16px, 2.2vw, 28px)',
        '--card-maxw': maxWidthVar ?? 'min(70ch, 90vw)',
        '--card-bg': baseBg ?? fallbackBg,
        '--card-text': textColor ?? '#f6f9fb',

        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        maxWidth: 'var(--card-maxw)',

        background:
            'linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.1)), var(--card-bg)',
        WebkitBackdropFilter: 'blur(var(--card-blur)) saturate(120%)',
        backdropFilter: 'blur(var(--card-blur)) saturate(120%)',

        color: 'var(--card-text)',
        boxShadow:
            '0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.18) inset, 0 8px 28px rgba(0,0,0,0.45)',
        display: 'block',
    };
});
