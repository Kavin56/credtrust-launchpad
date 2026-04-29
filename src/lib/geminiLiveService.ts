import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "./geminiTextService";

/**
 * Gemini Multimodal Live API Service
 * Uses the official @google/genai SDK for binary audio streaming
 */

const MODEL_ID = "gemini-3.1-flash-live-preview";

export interface LiveConnectionOptions {
  apiKey: string;
  onAudioData: (data: ArrayBuffer) => void;
  onTextData: (text: string) => void;
  onInputTextData?: (text: string) => void;
  onInterrupted: () => void;
  onTurnComplete: () => void;
  onError: (error: any) => void;
}

export class GeminiLiveClient {
  private ai: GoogleGenAI;
  private session: any;
  private options: LiveConnectionOptions;
  private isConnected: boolean = false;

  constructor(options: LiveConnectionOptions) {
    this.options = options;
    this.ai = new GoogleGenAI({ 
      apiKey: options.apiKey,
      apiVersion: 'v1alpha'
    });
  }

  async connect() {
    try {
      this.session = await this.ai.live.connect({
        model: MODEL_ID,
        callbacks: {
          onmessage: (message: any) => this.handleMessage(message),
          onerror: (event: any) => {
            if (!this.isConnected) return;
            this.options.onError(event);
          },
          onclose: () => {
            this.isConnected = false;
          },
        },
        config: {
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          responseModalities: ["AUDIO"],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" }
            }
          }
        }
      });

      this.isConnected = true;
      console.log("Gemini Live Session Established");
    } catch (error) {
      console.error("Live Connect Error:", error);
      this.options.onError(error);
    }
  }

  private handleMessage(message: any) {
    try {
      if (!message?.serverContent) return;
      const content = message.serverContent;

      if (content.inputTranscription?.text) {
        this.options.onInputTextData?.(content.inputTranscription.text);
      }

      if (content.outputTranscription?.text) {
        this.options.onTextData(content.outputTranscription.text);
      }

      if (content.modelTurn?.parts) {
        content.modelTurn.parts.forEach((part: any) => {
          const rawData = part?.inlineData?.data;
          if (typeof rawData === "string") {
            const binaryString = atob(rawData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            this.options.onAudioData(bytes.buffer);
          } else if (rawData instanceof ArrayBuffer) {
            this.options.onAudioData(rawData);
          } else if (ArrayBuffer.isView(rawData)) {
            this.options.onAudioData(rawData.buffer.slice(rawData.byteOffset, rawData.byteOffset + rawData.byteLength));
          }

          if (part?.text) {
            this.options.onTextData(part.text);
          }
        });
      }

      if (content.interrupted) {
        this.options.onInterrupted();
      }

      if (content.turnComplete) {
        this.options.onTurnComplete();
      }
    } catch (error) {
      if (!this.isConnected) return;
      console.error("Live Message Error:", error);
      this.options.onError(error);
    }
  }

  sendAudio(pcmData: Int16Array) {
    if (this.isConnected && this.session) {
      try {
        const bytes = new Uint8Array(pcmData.buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Audio = btoa(binary);
        this.session.sendRealtimeInput({
          audio: {
            data: base64Audio,
            mimeType: "audio/pcm;rate=16000",
          },
        });
      } catch (error) {
        this.options.onError(error);
      }
    }
  }

  sendText(text: string) {
    if (this.isConnected && this.session) {
      this.session.sendClientContent({
        turns: [{
          role: "user",
          parts: [{ text }]
        }],
        turnComplete: true
      });
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.session?.close) {
      this.session.close();
    }
    this.session = null;
  }
}
