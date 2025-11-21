import { createBrowserRouter } from 'react-router-dom';
import Home from './routes/Home.jsx';
import NotFound from './routes/NotFound.jsx';
import RootLayout from './layouts/RootLayout.jsx';

export const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RootLayout />,
            children: [
                {
                    index: true,
                    element: <Home />,
                },


                
                {
                    path: '*',
                    element: <NotFound />,
                }
            ]
        }
    ]
)