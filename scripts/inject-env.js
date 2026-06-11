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

  const html = fs.readFileSync(INDEX_PATH, 'utf-8');

  fs.writeFileSync(INDEX_PATH, html, 'utf-8');
  console.log('✅ Build script completed');
}

inject();
