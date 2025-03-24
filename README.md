# MCP Think Tool

This is an implementation of the "Think Tool" described in Anthropic's engineering blog post as an MCP server. The Think Tool is a simple but effective prompt engineering technique that helps Claude break down complex problems and enhance its reasoning capabilities.

## How it Works

The Think Tool is incredibly simple - it provides a no-op tool that does nothing except echo back the input. The magic is in how it allows Claude to:

1. Take a step back and think through complex problems
2. Break down reasoning into discrete steps
3. Organize thoughts more systematically
4. Cache intermediate results during complex calculations
5. Show its work when solving problems

As described by Anthropic, this is a "prompt engineering trick" where they use the standard tool calling mechanism to define a tool called "think" that "does nothing at all" - there is no implementation - it simply allows the model to use its existing training about when to use tools to stop and dump additional thoughts into the context.

## Implementation Details

The MCP server exposes a single tool:

1. `think` - Takes a thought as input and returns it

Tool definition:

```json
{
  "name": "think",
  "description": "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  "input_schema": {
    "type": "object",
    "properties": {
      "thought": {
        "type": "string",
        "description": "A thought to think about."
      }
    },
    "required": ["thought"]
  }
}
```

## Usage

### Setup

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile TypeScript
4. Run `npm start` to start the MCP server

### Connecting to Claude Desktop

Add this server to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "think-tool": {
      "command": "node",
      "args": ["/path/to/mcp-think-tool/build/index.js"]
    }
  }
}
```

Replace `/path/to/mcp-think-tool` with the actual path to this repository.

## Examples

Claude might use the Think Tool to work through a problem like:

```
Solving 235 × 47:

Think: First I'll break this down. I need to multiply 235 by 47.
Think: I'll start by calculating 235 × 40 = 9,400
Think: Then I'll calculate 235 × 7 = 1,645
Think: Now I add them together: 9,400 + 1,645 = 11,045

Therefore, 235 × 47 = 11,045
```

Or for a more complex reasoning task:

```
Think: I need to analyze the given problem carefully. The question asks about the impact of reducing carbon emissions by 15% over 5 years.
Think: First, I should establish the baseline emissions. The document mentions current annual emissions of 50 million metric tons.
Think: 15% reduction over 5 years means approximately 3% reduction per year, assuming linear decrease.
Think: After 5 years, annual emissions would be 50 × (1 - 0.15) = 50 × 0.85 = 42.5 million metric tons.
Think: The total reduction over 5 years would be the sum of the reductions each year...
```

## Development

- `src/index.ts` - MCP server implementation

## License

ISC
