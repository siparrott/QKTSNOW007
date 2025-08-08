import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ASSISTANT_ID = "asst_nINuiVStB5sKhKbNCgjeODI2";

async function testAssistant() {
  try {
    console.log("Testing Assistant connection...");
    
    // Test 1: Get assistant info
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log("✅ Assistant retrieved successfully:", {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model
    });
    
    // Test 2: Create thread
    const thread = await openai.beta.threads.create();
    console.log("✅ Thread created:", thread.id);
    
    // Test 3: Send a simple message
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: "Hello, can you help me create a simple calculator?"
    });
    console.log("✅ Message sent to thread");
    
    // Test 4: Create run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: ASSISTANT_ID
    });
    console.log("✅ Run created:", run.id);
    
    console.log("🎉 All tests passed! Assistant is working correctly.");
    
  } catch (error) {
    console.error("❌ Assistant test failed:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
  }
}

testAssistant();