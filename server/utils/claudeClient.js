import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const parseSOW = async (sowText) => {
  const prompt = "You are a contract analyst. Extract deliverables, revisions, timeline, payment terms, and out of scope items from this SOW. Return ONLY valid JSON with keys: deliverables, revisions, timeline, paymentTerms, outOfScope.\n\nSOW:\n" + sowText

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].text
  return JSON.parse(text)
}

export const analyseMessage = async (sowSummary, clientMessage) => {
  const prompt = "You are a freelance communication assistant. Here is the SOW summary: " + JSON.stringify(sowSummary) + "\n\nClient message: " + clientMessage + "\n\nReturn ONLY valid JSON with keys: verdict (within_scope/borderline/outside_scope), explanation, suggestedReply"

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].text
  return JSON.parse(text)
}