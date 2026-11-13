#!/usr/bin/env node
// Claude Code SessionStart: small bootstrap only; never installs or modifies anything.
const instruction = [
  'qark is available. For software development requests, discover and load the installed qark skill before making changes.',
  'Apply Impact-Driven Planning: execute explicitly authorized, isolated low-risk edits directly; investigate uncertainty; require a Technical Plan and user approval before materially changing business rules, data integrity, security, API/schema contracts, integrations, or architecture.',
  'For bugs or failed tests, check for the optional installed systematic-debugging skill, load it when available, and investigate root cause before proposing fixes. Never silently install a dependency or claim skill/tool use that did not occur.',
  'Preserve user intent, existing changes, and separate production/deployment authorization. Load specialist role instructions only when relevant.'
].join(' ');
process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: instruction }
}) + '\n');
