import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "mcp-think-tool",
  version: "1.0.0",
});

// Register the "think" tool
server.tool(
  "think",
  "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  {
    thought: z.string().describe("A thought to think about."),
  },
  async ({ thought }) => {
    // This tool does nothing at all - it's a no-op
    // It simply lets Claude externalize its thinking process
    return {
      content: [
        {
          type: "text",
          text: thought,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Think Tool Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
