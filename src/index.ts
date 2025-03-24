import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Define a simple in-memory storage for thoughts
interface Thought {
  id: string;
  content: string;
  tags: string[];
  createdAt: Date;
}

class MemoryStore {
  private thoughts: Map<string, Thought> = new Map();

  addThought(content: string, tags: string[] = []): Thought {
    const id = crypto.randomUUID();
    const thought: Thought = {
      id,
      content,
      tags,
      createdAt: new Date(),
    };
    this.thoughts.set(id, thought);
    return thought;
  }

  getAllThoughts(): Thought[] {
    return Array.from(this.thoughts.values());
  }

  getThoughtById(id: string): Thought | undefined {
    return this.thoughts.get(id);
  }

  getThoughtsByTag(tag: string): Thought[] {
    return Array.from(this.thoughts.values()).filter((thought) =>
      thought.tags.includes(tag)
    );
  }

  searchThoughts(query: string): Thought[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.thoughts.values()).filter(
      (thought) =>
        thought.content.toLowerCase().includes(lowerQuery) ||
        thought.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  deleteThought(id: string): boolean {
    return this.thoughts.delete(id);
  }
}

// Initialize the memory store
const memoryStore = new MemoryStore();

// Create an MCP server
const server = new McpServer({
  name: "ThinkTool",
  version: "1.0.0",
});

// Add a tool to save a new thought
server.tool(
  "save-thought",
  "Save a new thought to memory",
  {
    content: z.string().min(1).describe("The thought content"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Optional tags for categorization"),
  },
  async ({ content, tags = [] }) => {
    const thought = memoryStore.addThought(content, tags);
    return {
      content: [
        {
          type: "text",
          text: `Thought saved with ID: ${thought.id}`,
        },
      ],
    };
  }
);

// Add a tool to retrieve all thoughts
server.tool("list-thoughts", "List all saved thoughts", {}, async () => {
  const thoughts = memoryStore.getAllThoughts();

  if (thoughts.length === 0) {
    return {
      content: [{ type: "text", text: "No thoughts found in memory." }],
    };
  }

  const formattedThoughts = thoughts
    .map((thought) => {
      const date = thought.createdAt.toISOString().split("T")[0];
      const tagString =
        thought.tags.length > 0 ? `[${thought.tags.join(", ")}]` : "";
      return `- ${date} | ${thought.id.substring(0, 8)} | ${
        thought.content
      } ${tagString}`;
    })
    .join("\n");

  return {
    content: [
      {
        type: "text",
        text: `Found ${thoughts.length} thoughts:\n\n${formattedThoughts}`,
      },
    ],
  };
});

// Add a tool to search for thoughts
server.tool(
  "search-thoughts",
  "Search for thoughts by content or tags",
  {
    query: z.string().min(1).describe("Search query"),
  },
  async ({ query }) => {
    const thoughts = memoryStore.searchThoughts(query);

    if (thoughts.length === 0) {
      return {
        content: [
          { type: "text", text: `No thoughts found matching "${query}".` },
        ],
      };
    }

    const formattedThoughts = thoughts
      .map((thought) => {
        const date = thought.createdAt.toISOString().split("T")[0];
        const tagString =
          thought.tags.length > 0 ? `[${thought.tags.join(", ")}]` : "";
        return `- ${date} | ${thought.id.substring(0, 8)} | ${
          thought.content
        } ${tagString}`;
      })
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${thoughts.length} thoughts matching "${query}":\n\n${formattedThoughts}`,
        },
      ],
    };
  }
);

// Add a tool to filter thoughts by tag
server.tool(
  "filter-by-tag",
  "Filter thoughts by a specific tag",
  {
    tag: z.string().min(1).describe("Tag to filter by"),
  },
  async ({ tag }) => {
    const thoughts = memoryStore.getThoughtsByTag(tag);

    if (thoughts.length === 0) {
      return {
        content: [
          { type: "text", text: `No thoughts found with tag "${tag}".` },
        ],
      };
    }

    const formattedThoughts = thoughts
      .map((thought) => {
        const date = thought.createdAt.toISOString().split("T")[0];
        const tagString =
          thought.tags.length > 0 ? `[${thought.tags.join(", ")}]` : "";
        return `- ${date} | ${thought.id.substring(0, 8)} | ${
          thought.content
        } ${tagString}`;
      })
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${thoughts.length} thoughts with tag "${tag}":\n\n${formattedThoughts}`,
        },
      ],
    };
  }
);

// Add a tool to delete a thought
server.tool(
  "delete-thought",
  "Delete a thought from memory",
  {
    id: z.string().describe("ID of the thought to delete"),
  },
  async ({ id }) => {
    const success = memoryStore.deleteThought(id);

    if (success) {
      return {
        content: [
          { type: "text", text: `Thought with ID "${id}" was deleted.` },
        ],
      };
    } else {
      return {
        content: [{ type: "text", text: `No thought found with ID "${id}".` }],
        isError: true,
      };
    }
  }
);

// Start the server using stdio transport
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ThinkTool MCP Server running on stdio transport");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
