import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Page from './page';

const app = document.getElementById('app');
const root = createRoot(app);

root.render((
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Page />} />
        </Routes>    
    </BrowserRouter>
));
