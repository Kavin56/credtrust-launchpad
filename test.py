import asyncio
import os
import pyaudio
from pathlib import Path
import sys
from google import genai
from google.genai import types


MODEL_ID = "gemini-3.1-flash-live-preview" 


def load_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        return api_key

    env_path = Path(__file__).with_name(".env")
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("GEMINI_API_KEY="):
                value = line.split("=", 1)[1].strip()
                if value:
                    os.environ["GEMINI_API_KEY"] = value
                    return value

    raise RuntimeError("Missing GEMINI_API_KEY. Set it in the environment or .env file.")

# Audio Settings (Gemini Live standard)
FORMAT = pyaudio.paInt16
CHANNELS = 1
IN_RATE = 16000   # Required for input
OUT_RATE = 24000  # Required for output
CHUNK = 512       # Low chunk size for low latency

client = genai.Client(
    api_key=load_api_key(),
    http_options={"api_version": "v1alpha"},
)

async def main():
    p = pyaudio.PyAudio()
    mic_stream = None
    speaker_stream = None

    try:
        # Initialize Microphone Input
        mic_stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=IN_RATE,
            input=True,
            frames_per_buffer=CHUNK,
        )

        # Initialize Speaker Output
        speaker_stream = p.open(
            format=FORMAT,
            channels=CHANNELS,
            rate=OUT_RATE,
            output=True,
        )

        config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {"voice_name": "Puck"}
                }
            },
        }

        print("--- Connecting to Gemini Live API ---")

        while True:
            try:
                async with client.aio.live.connect(model=MODEL_ID, config=config) as session:
                    print("--- AI Ready! Speak naturally (Ctrl+C to stop) ---")
                    stop_event = asyncio.Event()

                    async def send_audio():
                        """Continuously stream mic PCM audio to Gemini Live."""
                        try:
                            while not stop_event.is_set():
                                data = await asyncio.to_thread(
                                    mic_stream.read,
                                    CHUNK,
                                    False,
                                )
                                await session.send_realtime_input(
                                    audio=types.Blob(
                                        data=data,
                                        mime_type=f"audio/pcm;rate={IN_RATE}",
                                    )
                                )
                        except asyncio.CancelledError:
                            raise
                        except Exception as exc:
                            stop_event.set()
                            raise RuntimeError(f"Mic streaming failed: {exc}") from exc

                    async def receive_responses():
                        """Play model audio and print transcriptions."""
                        try:
                            async for message in session.receive():
                                content = message.server_content
                                if not content:
                                    continue

                                if content.input_transcription:
                                    print(f"\rYou: {content.input_transcription.text}")

                                if content.output_transcription:
                                    print(f"\rGemini: {content.output_transcription.text}")

                                if content.model_turn:
                                    for part in content.model_turn.parts:
                                        if part.inline_data:
                                            await asyncio.to_thread(
                                                speaker_stream.write,
                                                part.inline_data.data,
                                            )

                                if content.interrupted:
                                    print("\n[AI Interrupted]")
                                    speaker_stream.stop_stream()
                                    speaker_stream.start_stream()

                                if content.turn_complete:
                                    print("\n[AI Turn Finished]")
                        finally:
                            stop_event.set()

                    sender = asyncio.create_task(send_audio())
                    receiver = asyncio.create_task(receive_responses())

                    done, pending = await asyncio.wait(
                        {sender, receiver},
                        return_when=asyncio.FIRST_EXCEPTION,
                    )

                    for task in pending:
                        task.cancel()

                    for task in pending:
                        try:
                            await task
                        except asyncio.CancelledError:
                            pass

                    for task in done:
                        task.result()

            except Exception as e:
                print(f"\n[Session Error]: {e}. Reconnecting in 3s...")
                await asyncio.sleep(3)
    finally:
        if mic_stream is not None:
            mic_stream.stop_stream()
            mic_stream.close()
        if speaker_stream is not None:
            speaker_stream.stop_stream()
            speaker_stream.close()
        p.terminate()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n--- Session Closed ---")
        sys.exit(0)