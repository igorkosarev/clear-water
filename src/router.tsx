import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import Configurator from './pages/Configurator'
import Contaminants from './pages/Learn/Contaminants'
import Methods from './pages/Learn/Methods'
import Systems from './pages/Systems'
import SystemDetail from './pages/Systems/SystemDetail'
import Build from './pages/Build'
import ModuleLibrary from './pages/Build/ModuleLibrary'
import AssemblyGuide from './pages/Build/AssemblyGuide'
import Suppliers from './pages/Suppliers'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'configurator', element: <Configurator /> },
      { path: 'learn/contaminants', element: <Contaminants /> },
      { path: 'learn/methods', element: <Methods /> },
      { path: 'systems', element: <Systems /> },
      { path: 'systems/:id', element: <SystemDetail /> },
      { path: 'build', element: <Build /> },
      { path: 'build/modules', element: <ModuleLibrary /> },
      { path: 'build/modules/:id', element: <ModuleLibrary /> },
      { path: 'build/guides/:id', element: <AssemblyGuide /> },
      { path: 'suppliers', element: <Suppliers /> },
    ],
  },
])
