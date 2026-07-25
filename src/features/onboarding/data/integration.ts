import { BRAND } from "@/constants/brand";
import { API_KEY_SCOPES, SCOPE_LABEL, type ApiKeyScope } from "@/features/settings";

/** A single scope an agent key may be granted. `id` is the backend
 * `ApiKeyScope` literal, so it's sent verbatim (and compiler-checked) when
 * minting the key. */
export type IntegrationScope = {
  id: ApiKeyScope;
  label: string;
};

/** Scopes requested for the agent key created during onboarding — currently all
 * of them, since the onboarding key is the tenant's general-purpose agent key. */
export const AGENT_SCOPES: IntegrationScope[] = API_KEY_SCOPES.map((id) => ({
  id,
  label: SCOPE_LABEL[id],
}));

/** Values needed to template every copy-paste snippet on the integrate step. */
export interface IntegrationValues {
  /** MCP / brain endpoint agents query (from `GET /settings`). */
  endpoint: string;
  /** Raw agent API key, minted once server-side. */
  apiKey: string;
  /** Workspace slug — used as the MCP server name in configs. */
  slug: string;
  /** Workspace display name, for the prompt copy. */
  workspaceName: string;
}

/**
 * System prompt the tenant pastes into their own agents so they ground every
 * answer in the company brain instead of guessing.
 */
export function buildSystemPrompt(workspaceName: string): string {
  return `You are an agent for ${workspaceName}, backed by the ${BRAND.name} company brain.

The ${BRAND.name} brain is the single source of truth for company decisions, policies, runbooks, and support patterns extracted from Slack, Notion, GitHub, Jira, Zendesk, and Google Drive.

Rules:
- Before answering anything about company policy, process, or past decisions, query the brain via the connected ${BRAND.name} MCP tool.
- Ground every claim in brain sources. Cite the returned source labels (e.g. "Policy Library", "#cs-escalations") in your answer.
- If the brain returns low confidence or no sources, say so plainly and do not invent a policy.
- Prefer the most recent decision when sources conflict, and surface the conflict to the user.
- Never expose the API key, internal IDs, or raw source URLs unless the user explicitly asks for a reference.`;
}

/** Example MCP client config wiring the endpoint + key together. */
export function buildClientConfig(endpoint: string, apiKey: string): string {
  return `{
  "mcpServers": {
    "${BRAND.name.toLowerCase()}": {
      "url": "${endpoint}",
      "headers": {
        "Authorization": "Bearer ${apiKey}"
      }
    }
  }
}`;
}

/** A single copy-paste snippet within an agent guide. */
export type GuideBlock = {
  /** Short label shown on the snippet's header bar. */
  title: string;
  code: string;
};

/** Instructions for wiring the brain into one agent framework / client. */
export type AgentGuide = {
  id: string;
  label: string;
  /** One-line orientation for this framework. */
  blurb: string;
  blocks: GuideBlock[];
  /** Where the system prompt above belongs for this agent. */
  promptNote: string;
};

/**
 * Per-agent setup guides surfaced on the integration step. Each shows the
 * minimal config to point that framework at the brain over MCP, plus where the
 * agent system prompt belongs. Every snippet is pre-filled with the tenant's
 * live endpoint and key.
 */
export function buildAgentGuides({
  endpoint,
  apiKey,
  slug,
}: Pick<IntegrationValues, "endpoint" | "apiKey" | "slug">): AgentGuide[] {
  return [
    {
      id: "claude-code",
      label: "Claude Code",
      blurb:
        "Claude Code speaks MCP natively. Register the brain as an HTTP server, then ground it with the system prompt.",
      blocks: [
        {
          title: "Register the MCP server",
          code: `claude mcp add --transport http ${slug} \\
  ${endpoint} \\
  --header "Authorization: Bearer ${apiKey}"`,
        },
        {
          title: "Apply the system prompt",
          code: `# Paste the system prompt above into CLAUDE.md,
# or pass it per-session:
claude --append-system-prompt "$(cat ${slug}-brain.txt)"`,
        },
      ],
      promptNote:
        "Put the system prompt in your project's CLAUDE.md so every session is grounded in the brain.",
    },
    {
      id: "claude-api",
      label: "Claude API",
      blurb:
        "Use the Messages API with the system prompt and the remote MCP connector (beta) to expose the brain as a tool.",
      blocks: [
        {
          title: "python",
          code: `import anthropic

client = anthropic.Anthropic()

resp = client.beta.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    system=BRAINITE_SYSTEM_PROMPT,  # the prompt above
    mcp_servers=[
        {
            "type": "url",
            "url": "${endpoint}",
            "name": "${slug}",
            "authorization_token": "${apiKey}",
        }
    ],
    messages=[{"role": "user", "content": "What's our refund policy?"}],
    betas=["mcp-client-2025-04-04"],
)
print(resp.content)`,
        },
      ],
      promptNote:
        "Pass the system prompt as the `system` parameter; the MCP connector exposes the brain's query tool automatically.",
    },
    {
      id: "openai-codex",
      label: "OpenAI / Codex",
      blurb:
        "Codex CLI and the OpenAI Responses API both support remote MCP tools. Add the brain, then set the system prompt as instructions.",
      blocks: [
        {
          title: "Codex CLI · ~/.codex/config.toml",
          code: `[mcp_servers.${slug}]
url = "${endpoint}"
http_headers = { Authorization = "Bearer ${apiKey}" }`,
        },
        {
          title: "Responses API · python",
          code: `from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    instructions=BRAINITE_SYSTEM_PROMPT,  # the prompt above
    tools=[
        {
            "type": "mcp",
            "server_label": "${slug}",
            "server_url": "${endpoint}",
            "headers": {"Authorization": "Bearer ${apiKey}"},
            "require_approval": "never",
        }
    ],
    input="What's our refund policy for premium customers?",
)
print(resp.output_text)`,
        },
      ],
      promptNote:
        "Use `instructions` (Responses API) or a `developer`/`system` message (Chat Completions) for the system prompt.",
    },
    {
      id: "langchain",
      label: "LangChain",
      blurb:
        "Load the brain's tools with langchain-mcp-adapters, then build an agent with the system prompt.",
      blocks: [
        {
          title: "python",
          code: `from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import create_react_agent

client = MultiServerMCPClient({
    "${slug}": {
        "transport": "streamable_http",
        "url": "${endpoint}",
        "headers": {"Authorization": "Bearer ${apiKey}"},
    }
})

tools = await client.get_tools()
model = init_chat_model("anthropic:claude-opus-4-8")
agent = create_react_agent(model, tools, prompt=BRAINITE_SYSTEM_PROMPT)

result = await agent.ainvoke(
    {"messages": [{"role": "user", "content": "What's our incident process?"}]}
)`,
        },
      ],
      promptNote:
        "Pass the system prompt as the agent's `prompt` (or prepend a `SystemMessage`).",
    },
    {
      id: "other",
      label: "Other MCP clients",
      blurb:
        "Cursor, Windsurf, VS Code, and Cline all read the same MCP config. Drop this into the client's mcp.json.",
      blocks: [
        {
          title: "mcp.json",
          code: buildClientConfig(endpoint, apiKey),
        },
      ],
      promptNote:
        "Paste the system prompt into the client's custom / system instructions, then restart it to load the brain tool.",
    },
  ];
}
