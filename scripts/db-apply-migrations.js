#!/usr/bin/env node
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const script = path.join(__dirname, '..', 'portal-app', 'scripts', 'db-apply-migrations.js')
const result = spawnSync(process.execPath, [script], { stdio: 'inherit' })
process.exit(result.status ?? 0)
