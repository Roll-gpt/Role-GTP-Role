import { GoogleGenAI, Content, SafetySetting, HarmCategory, HarmBlockThreshold, GenerateContentParameters } from "@google/genai";
import { Message, Role, ApiConfiguration, Part, Project } from '../types';
import { state } from '../state';

function buildSystemInstruction(role: Role, project: Project | null): string {
    let combinedPrompt = role.prompt;

     // Add project context if available
    if (project) {
        let projectContext = '\n\n[PROJECT CONTEXT]\n';
        if (project.guidelines) {
            projectContext += `Guidelines: ${project.guidelines}\n`;
        }
        if (project.memory && project.memory.length > 0) {
            const memoryText = project.memory.map(m => `- ${m.content}`).join('\n');
            projectContext += `Memory:\n${memoryText}\n`;
        }
        if (project.files && project.files.length > 0) {
             const fileText = project.files.map(f => `File: ${f.name}\nContent:\n${f.content.substring(0, 2000)}...\n`).join('\n---\n');
             projectContext += `Referenced Files:\n${fileText}\n`;
        }
        combinedPrompt += projectContext;
    }

    const keywordInstructions = role.keywordIds
        .map(id => state.masterKeywords.find(kw => kw.id === id))
        .filter(kw => kw && kw.description)
        .map(kw => `- ${kw!.name}: ${kw!.description}`)
        .join('\n');

    if (keywordInstructions) {
        combinedPrompt += `\n\n[ADDITIONAL INSTRUCTIONS]\nYou must adhere to the following rules in your responses:\n${keywordInstructions}`;
    }
    return combinedPrompt;
}

export async function* streamGeminiMessage(
    apiConfig: ApiConfiguration,
    role: Role,
    history: Message[],
    newUserParts: Part[]
): AsyncGenerator<string> {
    
    if (!apiConfig.apiKey) {
        throw new Error("Gemini API key is not set for this Role.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiConfig.apiKey });
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        const project = activeChat?.projectId ? state.projects.find(p => p.id === activeChat.projectId) : null;

        const systemInstruction = buildSystemInstruction(role, project);

        const geminiHistory: Content[] = history
            .slice(0, -1) // Exclude the very last user message, which is in newUserParts
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
        
        const contents: Content[] = [
            ...geminiHistory,
            { role: 'user', parts: newUserParts }
        ];

        const safetySettings: SafetySetting[] = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: role.safetyLevel as HarmBlockThreshold },
        ];
        
        const request: GenerateContentParameters = {
            model: apiConfig.modelName || 'gemma-3-27b-it',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: role.temperature,
                maxOutputTokens: role.maxOutputTokens,
                safetySettings: safetySettings,
            }
        };
        
        const result = await ai.models.generateContentStream(request);

        for await (const chunk of result) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error streaming Gemini message:", error);
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to get response from Gemini: ${errorMsg}`);
    }
}


// This function now calls our secure serverless function instead of the Gemini SDK directly.
export async function* streamTrialMessage(
    role: Role,
    history: Message[],
    newUserParts: Part[],
    signal?: AbortSignal
): AsyncGenerator<string> {
    
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    const project = activeChat?.projectId ? state.projects.find(p => p.id === activeChat.projectId) : null;
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                role, 
                history, 
                newUserParts,
                project,
                masterKeywords: state.masterKeywords
            }),
        });

        if (!response.ok) {
            let errorMessage = `Server responded with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
                // JSON 파싱 실패시 기본 에러 메시지 사용
                console.warn('Failed to parse error response as JSON:', parseError);
            }
            throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Could not read response stream from server.");
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data) {
                        try {
                            yield JSON.parse(data);
                        } catch (e) {
                            console.error("Error parsing trial stream data:", e, "Data:", data);
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error("Error calling trial service:", error);
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred with the trial service.";
        throw new Error(errorMsg);
    }
}
