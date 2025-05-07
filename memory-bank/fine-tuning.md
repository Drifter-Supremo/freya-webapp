# Migration Tasks: Switching from Gemini API to Fine-Tuned OpenAI GPT-4.1 Mini Model

This document outlines the tasks required to migrate the Freya web app from Gemini 1.5 Pro to a fine‑tuned OpenAI GPT‑4.1 Mini model. Tasks are divided into phases to ensure a structured and complete transition.

----------

## Phase 1: Preparation and Setup

-   [ ] **Task 1.2: Install OpenAI JavaScript Library**
    
    -   [ ] **Description:** Add the OpenAI JavaScript library to the project.
    -   [ ] **Run** `npm install openai` in the project directory (if using npm).
    -   [ ] **Import** the library in `/js/apiLogic.js` with `import OpenAI from "openai";`.
-   [ ] **Task 1.3: Prepare Fine‑Tuning Dataset**
    
    -   [ ] **Description:** Verify or prepare the `finetuning_dataset.jsonl` file for fine‑tuning.
    -   [ ] **Ensure** the dataset follows OpenAI’s format (e.g., JSONL with `messages` or `prompt` / `completion` pairs).
    -   [ ] **Curate** data from existing conversations or memory files in `memory-bank/` if the dataset is incomplete.

----------

## Phase 3: Update API Logic

-   [ ] **Task 3.1: Update API Configuration**
    
    -   [ ] **Description:** Replace Gemini configuration with OpenAI configuration.
    -   [ ] **Set** the model name to your fine‑tuned model’s ID.
    -   [ ] **Point** environment variables or local storage to the OpenAI API key.
-   [ ] **Task 3.2: Revise `sendMessageToAPI` Function**
    
    -   [ ] **Description:** Modify `/js/apiLogic.js` to use the OpenAI API.
        
    -   [ ] **Update** the function to initialize OpenAI and make a request:
        
        ```javascript
        const openai = new OpenAI({ apiKey: localStorage.getItem("apiKey") });
        const response = await openai.chat.completions.create({
          model: "your-fine-tuned-model-name",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
          ],
        });
        ```
        
    -   [ ] **Replace** `systemPrompt` and `userInput` with existing variables from the codebase.
        
-   [ ] **Task 3.3: Process OpenAI Response**
    
    -   [ ] **Description:** Handle the API response in `sendMessageToAPI`.
    -   [ ] **Extract** `response.choices[0].message.content` and display it in the chat UI.
    -   [ ] **Implement** error handling for rate limits, invalid keys, and model downtime.

----------

## Phase 4: Adjust Prompts and Context

-   [ ] **Task 4.1: Update System Prompt**
    
    -   [ ] **Description:** Rewrite the system prompt for the fine‑tuned model.
    -   [ ] **Include** Freya’s persona and any relevant behavioral instructions.
-   [ ] **Task 4.2: Adapt Memory Context**
    
    -   [ ] **Description:** Ensure long‑term memory and contextual injections still work.
    -   [ ] **Verify** retrieval logic and chunk sizes against OpenAI’s token limits.
-   [ ] **Task 4.3: Validate Prompt and Context**
    
    -   [ ] **Description:** Test the prompt and context integration.
    -   [ ] **Send** sample inputs via the OpenAI Playground or local tests.
    -   [ ] **Confirm** Freya’s responses align with expectations.

----------

## Phase 5: Testing and Validation

-   [ ] **Task 5.1: Unit Test API Logic**
    
    -   [ ] **Description:** Test the updated `sendMessageToAPI`.
    -   [ ] **Check** various inputs and error cases (e.g., invalid key, model unavailable).
-   [ ] **Task 5.2: Integration Test Chatbot**
    
    -   [ ] **Description:** Test the chatbot in the web UI.
    -   [ ] **Confirm** end‑to‑end communication and UI updates.
-   [ ] **Task 5.3: Confirm Personality and Memory**
    
    -   [ ] **Description:** Ensure Freya’s personality and memory features function as intended.
    -   [ ] **Validate** across multiple conversations and edge cases.

----------

## Phase 6: Cleanup and Documentation

-   [ ] **Task 6.1: Remove Gemini Code**
    
    -   [ ] **Description:** Delete unused Gemini references.
    -   [ ] **Remove** redundant imports, config files, and test cases.
-   [ ] **Task 6.2: Update Documentation**
    
    -   [ ] **Description:** Update README and comments.
    -   [ ] **Replace** Gemini references with OpenAI details.
-   [ ] **Task 6.3: Commit Changes**
    
    -   [ ] **Description:** Save all updates to version control.
    -   [ ] **Commit** with a clear message like “Migrated Freya to fine‑tuned OpenAI GPT‑4.1 Mini”.

----------

### Notes

- **Dependencies:** Fine‑tuning (Phase 2) must complete before API updates (Phase 3).
- **Security:** Consider moving API keys from local storage to a more secure solution post‑migration.
- **Testing:** Expand test coverage as suggested in the audit, if time allows.

## Recent Session Updates

- API logic updated in js/apiLogic.js to use the fine‑tuned OpenAI GPT‑4.1 Mini model.
- Refined API key management and error handling.
- Verified Firebase configuration in js/firebaseEnv.js and confirmed installation of the "openai" npm dependency.
- Documentation in memory-bank files updated to reflect these changes.
