import { createBrowserRouter, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import RootLayout from './layouts/RootLayout.jsx';

const Home = lazy(() => import('./routes/Home.jsx'));
const NotFound = lazy(() => import('./routes/NotFound.jsx'));
const Projects = lazy(() => import('./routes/Projects.jsx'));
const ProjectDetails = lazy(() => import('./routes/ProjectDetails.jsx'));
const Wiki = lazy(() => import('./routes/Wiki.jsx'));
const I18nProjects = lazy(() => import('./routes/I18nProjects.jsx'));
const ManageI18nProject = lazy(() => import('./routes/ManageI18nProject.jsx'));
const I18nContributeProject = lazy(() => import('./routes/I18nContributeProject.jsx'));
const I18nModeration = lazy(() => import('./routes/I18nModeration.jsx'));

function withSuspense(element) {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
            {element}
        </Suspense>
    );
}

export const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RootLayout />,
            children: [
                {
                    index: true,
                    element: withSuspense(<Home />),
                },

                {
                    path: 'projects',
                    element: <Outlet />,
                    children: [
                        {
                            index: true,
                            element: withSuspense(<Projects />),
                        },
                        {
                            element: <Outlet />,
                            path: ':projectId',
                            children: [
                                {
                                    index: true,
                                    element: withSuspense(<ProjectDetails />),
                                },
                                {
                                    path: "wiki/*",
                                    element: withSuspense(<Wiki />)
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
                            element: withSuspense(<I18nProjects />)
                        },
                        {
                            path: ":slug",
                            element: withSuspense(<I18nContributeProject />)
                        },
                        {
                            path: ":slug/manage",
                            element: withSuspense(<ManageI18nProject />)
                        },
                        {
                            path: ":slug/moderate",
                            element: withSuspense(<I18nModeration />)
                        }
                    ]
                },
                
                {
                    path: '*',
                    element: withSuspense(<NotFound />),
                }
            ]
        }
    ]
)
