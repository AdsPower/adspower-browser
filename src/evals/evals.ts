//evals.ts

import { EvalConfig } from 'mcp-evals';
import { openai } from "@ai-sdk/openai";
import { grade, EvalFunction } from "mcp-evals";

const openBrowserEval: EvalFunction = {
    name: 'open-browser Tool Evaluation',
    description: 'Evaluates the open-browser tool functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Open the browser with an environment of 'staging' and a profile of 'user-profile' to visit https://example.com");
        return JSON.parse(result);
    }
};

const closeBrowserEval: EvalFunction = {
    name: 'close-browser Evaluation',
    description: 'Evaluates the close-browser tool functionality',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please close my current browser session and confirm it's done.");
        return JSON.parse(result);
    }
};

const createBrowserEval: EvalFunction = {
  name: "Create Browser Tool Evaluation",
  description: "Evaluates the creation of a browser instance",
  run: async () => {
    const result = await grade(openai("gpt-4"), "Please create a new browser instance and confirm it is ready for further actions.");
    return JSON.parse(result);
  }
};

const updateBrowserEval: EvalFunction = {
    name: 'update-browser',
    description: 'Tests the update-browser tool by prompting a browser update request',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please update my browser to the latest version.");
        return JSON.parse(result);
    }
};

const deleteBrowserEval: EvalFunction = {
    name: 'Delete Browser Tool Evaluation',
    description: 'Evaluates the functionality of the delete browser tool',
    run: async () => {
        const result = await grade(openai("gpt-4"), "Please delete the browser completely. Can you remove it from memory?");
        return JSON.parse(result);
    }
};

const config: EvalConfig = {
    model: openai("gpt-4"),
    evals: [openBrowserEval, closeBrowserEval, createBrowserEval, updateBrowserEval, deleteBrowserEval]
};
  
export default config;
  
export const evals = [openBrowserEval, closeBrowserEval, createBrowserEval, updateBrowserEval, deleteBrowserEval];