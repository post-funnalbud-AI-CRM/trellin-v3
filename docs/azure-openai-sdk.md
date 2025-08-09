Endpoint

Target URI

https://submaiteopenai.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview

Key
E3r7Hq6foeCvUiC84or4PdzLGtgpyTcVLjN3ZXagRYYk33vbFObXJQQJ99BHACYeBjFXJ3w3AAABACOG1Xrs

Get Started

Below are example code snippets for a few use cases. For additional information about Azure OpenAI SDK, see full documentation
and samples

.
1. Authentication using API Key

For OpenAI API Endpoints, deploy the Model to generate the endpoint URL and an API key to authenticate against the service. In this sample endpoint and key are strings holding the endpoint URL and the API Key.

The API endpoint URL and API key can be found on the Deployments + Endpoint page once the model is deployed.

To create a client with the OpenAI SDK using an API key, initialize the client by passing your API key to the SDK's configuration. This allows you to authenticate and interact with OpenAI's services seamlessly:

const apiKey = "<your-api-key>";
const apiVersion = "2024-04-01-preview";
const endpoint = "https://submaiteopenai.openai.azure.com/";
const modelName = "gpt-4o";
const deployment = "gpt-4o";
const options = { endpoint, apiKey, deployment, apiVersion }

const client = new AzureOpenAI(options);

2. Install dependencies

    Install Node.js 

    .

    Copy the following lines of text and save them as a file package.json inside your folder.

{
  "type": "module",
  "dependencies": {
    "openai": "latest",
    "@azure/identity": "latest"
  }
}

    Note: @azure/core-sse is only needed when you stream the chat completions response.

    Open a terminal window in this folder and run npm install.

    For each of the code snippets below, copy the content into a file sample.js and run with node sample.js.

Open a terminal window in this folder and run npm install.

For each of the code snippets below, copy the content into a file sample.js and run with node sample.js.
3. Run a basic code sample

This sample demonstrates a basic call to the chat completion API. The call is synchronous.

import { AzureOpenAI } from "openai";

const endpoint = "https://submaiteopenai.openai.azure.com/";
const modelName = "gpt-4o";
const deployment = "gpt-4o";

export async function main() {

  const apiKey = "<your-api-key>";
  const apiVersion = "2024-04-01-preview";
  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Paris, what should I see?" }
    ],
    max_tokens: 4096,
      temperature: 1,
      top_p: 1,
      model: modelName
  });

  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }
  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});

4. Explore more samples
Run a multi-turn conversation

This sample demonstrates a multi-turn conversation with the chat completion API. When using the model for a chat application, you'll need to manage the history of that conversation and send the latest messages to the model.

import { AzureOpenAI } from "openai";

const endpoint = "https://submaiteopenai.openai.azure.com/";
const modelName = "gpt-4o";
const deployment = "gpt-4o";

export async function main() {

  const apiKey = "<your-api-key>";
  const apiVersion = "2024-04-01-preview";
  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Paris, what should I see?" }
    ],
    max_tokens: 4096,
      temperature: 1,
      top_p: 1,
      model: modelName
  });

  if (response?.error !== undefined && response.status !== "200") {
    throw response.error;
  }

  for (const choice of response.choices) {
    console.log(choice.message.content);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});

Stream the output

For a better user experience, you will want to stream the response of the model so that the first token shows up early and you avoid waiting for long responses.

import { AzureOpenAI } from "openai";

const endpoint = "https://submaiteopenai.openai.azure.com/";
const modelName = "gpt-4o";
const deployment = "gpt-4o";

export async function main() {

  const apiKey = "<your-api-key>";
  const apiVersion = "2024-04-01-preview";
  const options = { endpoint, apiKey, deployment, apiVersion }

  const client = new AzureOpenAI(options);

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "You are a helpful assistant." },
      { role:"user", content: "I am going to Paris, what should I see?" }
    ],
    stream: true,
    max_tokens: 4096,
      temperature: 1,
      top_p: 1,
      model: modelName
  });

  for await (const part of response) {
    process.stdout.write(part.choices[0]?.delta?.content || '');
  }
  process.stdout.write('\n');
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});