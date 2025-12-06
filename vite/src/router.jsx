import { createBrowserRouter, Outlet } from 'react-router-dom';
import Home from './routes/Home.jsx';
import NotFound from './routes/NotFound.jsx';
import RootLayout from './layouts/RootLayout.jsx';
import Projects from './routes/Projects.jsx';
import ProjectDetails from './routes/ProjectDetails.jsx';
import Wiki from './routes/Wiki.jsx';
import I18nProjects from './routes/I18nProjects.jsx';
import ManageI18nProject from './routes/ManageI18nProject.jsx';
import I18nContributeProject from './routes/I18nContributeProject.jsx';
import I18nModeration from './routes/I18NModeration.jsx';

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
                    element: <Outlet />,
                    children: [
                        {
                            index: true,
                            element: <Projects />,
                        },
                        {
                            element: <Outlet />,
                            path: ':projectId',
                            children: [
                                {
                                    index: true,
                                    element: <ProjectDetails />,
                                },
                                {
                                    path: "wiki/*",
                                    element: <Wiki />
                                }
                            ]
                        }
                    ]
                },

                {
                    path: 'i18n',
                    element: <Outlet />,
                    children: [
                        {
                            index: true,
                            element: <I18nProjects />
                        },
                        {
                            path: ":slug",
                            element: <I18nContributeProject />
                        },
                        {
                            path: ":slug/manage",
                            element: <ManageI18nProject />
                        },
                        {
                            path: ":slug/moderate",
                            element: <I18nModeration />
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