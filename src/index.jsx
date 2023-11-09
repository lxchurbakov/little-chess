import React from 'react';
import { createRoot } from 'react-dom/client';

import Page from './page';

const app = document.getElementById('app');
const root = createRoot(app);

root.render(
    <Page />
);
