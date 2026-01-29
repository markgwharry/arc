import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ItemsPage from './pages/ItemsPage'
import QuestsPage from './pages/QuestsPage'
import MapsPage from './pages/MapsPage'
import LoadoutsPage from './pages/LoadoutsPage'
import EventsPage from './pages/EventsPage'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ItemsPage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="maps" element={<MapsPage />} />
          <Route path="loadouts" element={<LoadoutsPage />} />
          <Route path="events" element={<EventsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
