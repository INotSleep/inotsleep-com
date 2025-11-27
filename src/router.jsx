import { createBrowserRouter, Outlet } from 'react-router-dom';
import Home from './routes/Home.jsx';
import NotFound from './routes/NotFound.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import Projects from './routes/Projects.jsx';
import ProjectDetails from './routes/ProjectDetails.jsx';

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
                    path: 'projects',
                    element: <Outlet / >,
                    children: [
                        {
                            index: true,
                            element: <Projects />,
                        },
                        {
                            element: <ProjectDetails />,
                            path: ':projectId'
                        }
                    ]
                },
                
                {
                    path: '*',
                    element: <NotFound />,
                }
            ]
        }
    ]
)