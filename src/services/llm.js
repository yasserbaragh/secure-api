// Stand-in for a real LLM (see README). No secret in the prompt: what the model never sees, it cannot leak.
const SYSTEM_PROMPT = `You are SouqBot, the support assistant of SouqDZ.
Only talk about the current customer's orders and about products.`;

function askModel(message) {
  const m = message.toLowerCase();
  if (m.includes('system prompt') || (m.includes('ignore') && m.includes('instruction'))) {
    return SYSTEM_PROMPT;
  }
  if (m.includes('order')) return { tool: 'lookup_orders' };
  return 'Hello! I can help with your orders and products.';
}

module.exports = { askModel };
