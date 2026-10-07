#!/usr/bin/env node
// Stand-in for the `claude` CLI in tests: answers --version, and for -p reads
// the prompt from stdin and replies in the stream-json shape Claude Code uses.

if (process.argv.includes('--version')) {
  console.log('9.9.9 (Fake Claude)');
  process.exit(0);
}

let prompt = '';
process.stdin.on('data', (c) => { prompt += c; });
process.stdin.on('end', () => {
  const out = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);
  const tools = process.argv[process.argv.indexOf('--allowedTools') + 1];
  out({ type: 'system', subtype: 'init' });
  out({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'WebSearch', input: { query: 'dhaka land share' } }] } });
  out({ type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: '# Fake result\n' } } });
  out({ type: 'assistant', message: { content: [{ type: 'text', text: '# Fake result\n' }] } });
  const result = `# Fake result\n\nPrompt had ${prompt.length} chars.\n\nTools: ${tools}\n\n${prompt}`;
  out({ type: 'result', subtype: 'success', is_error: false, result, total_cost_usd: 0.0123 });
});
