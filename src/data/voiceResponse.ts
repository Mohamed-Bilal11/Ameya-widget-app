export const voiceResponse = {
    id: "chatcmpl-9b8391bd-1234-5678-9012-abcdefabcdef",
    object: "chat.completion",
    created: 1722250000,
    model: "gpt-3.5-turbo-0613",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "{\n  \"screen\": \"FoodLog\",\n  \"filters\": {\n    \"meal\": \"lunch\",\n    \"item\": \"1 banana\",\n    \"date\": \"2025-07-29\"\n  }\n}"
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: 91,
      completion_tokens: 29,
      total_tokens: 120
    }
  }
  