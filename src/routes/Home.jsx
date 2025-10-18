import { GlassPaper } from "../objects/GlassPaper";

export function Home() {
    return <GlassPaper elevation={0} sx={{ maxWidth: 'min(70ch, 90vw)', textAlign: 'center' }}>
        Home Page
    </GlassPaper>;
}