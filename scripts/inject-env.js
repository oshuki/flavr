#!/usr/bin/env node
/**
 * Build script: Replace environment variable placeholders in index.html
 * Used during Netlify/Railway deploy to inject runtime secrets safely.
 */

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, '../index.html');

function inject() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error('❌ index.html not found at:', INDEX_PATH);
    process.exit(1);
  }

  let html = fs.readFileSync(INDEX_PATH, 'utf-8');

  // Replace Sentry DSN placeholder with environment variable
  const sentryDsn = process.env.SENTRY_DSN_FRONTEND || process.env.VITE_SENTRY_DSN_FRONTEND || '';
  
  if (sentryDsn && sentryDsn.startsWith('https://')) {
    html = html.replace('%SENTRY_DSN_CLIENT%', sentryDsn);
    console.log('✅ Injected SENTRY_DSN_FRONTEND into index.html');
  } else {
    console.log('⚠️  No valid SENTRY_DSN_FRONTEND found, leaving placeholder');
  }

  // Future: add other environment variable replacements here
  // e.g., html = html.replace('%API_URL%', process.env.API_URL || '');

  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  console.log('✅ Build script completed');
}

inject();
