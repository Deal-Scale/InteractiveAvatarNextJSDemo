Feature: Audio Sample Rate Enforcement

  As a developer
  I want all AudioContexts to use the same sample rate (default 16000 Hz, overrideable)
  So that createMediaStreamSource does not error due to differing sample rates

  Background:
    Given the early audio instrumentation runs before hydration in app/layout.tsx
    And components/AudioDebugShim.tsx logs audio diagnostics post-hydration
    And navigator.mediaDevices.getUserMedia is patched to remove sampleRate and channelCount and disable EC/NS/AGC

  Scenario: Default to 16000 Hz when no override is present
    Given localStorage has no key "force_sr"
    When the page loads
    Then an AudioContext created by the app logs "[AudioDebugEarly] AudioContext created" with sampleRate 16000
    And an AudioContext created by the SDK logs "[AudioDebugEarly] AudioContext created" with sampleRate 16000
    And when createMediaStreamSource is called it logs "[AudioDebugEarly] createMediaStreamSource: context SR= 16000"

  Scenario: Override sample rate to 16000 Hz explicitly
    Given I set localStorage "force_sr" to "16000"
    When I hard reload with cache disabled
    Then all AudioContext creations log sampleRate 16000
    And createMediaStreamSource logs context SR= 16000
    And no error "Connecting AudioNodes from AudioContexts with different sample-rate is currently not supported." occurs

  Scenario: Override sample rate to 48000 Hz explicitly
    Given I set localStorage "force_sr" to "48000"
    When I hard reload with cache disabled
    Then all AudioContext creations log sampleRate 48000
    And createMediaStreamSource logs context SR= 48000
    And no error "Connecting AudioNodes from AudioContexts with different sample-rate is currently not supported." occurs

  Scenario: getUserMedia constraints are sanitized
    When getUserMedia is called
    Then the patched constraints log shows sampleRate and channelCount removed
    And echoCancellation, noiseSuppression, autoGainControl are false
    And the track settings log after stream acquisition is printed

  Scenario: Diagnostics are printed both early and post-hydration
    When the app bootstraps
    Then "[AudioDebugEarly] ..." logs appear from app/layout.tsx
    And "[AudioDebugShim] ..." logs appear from components/AudioDebugShim.tsx

  # File locations and implementation details:
  # - app/layout.tsx: Early AudioContext patch injects forced sampleRate from localStorage "force_sr" (default 16000)
  # - components/AudioDebugShim.tsx: Logs getUserMedia constraints, AudioContext creations, and createMediaStreamSource context sample rate
  # - Acceptance: All AudioContexts log the correct sample rate, no mismatch errors, getUserMedia logs show sanitized constraints

Rule: Heygen Interactive Avatar tasks accept only text input

  # As a developer I need to send only text to Heygen's Interactive Avatar task endpoint
  # So that the avatar can speak the provided text; any audio must be transcribed first

  Scenario: Send a text task to an Interactive Avatar
    Given the Heygen task endpoint "https://api.heygen.com/v1/streaming.task"
    And I have a valid session_id "<SESSION_ID>"
    And I have text "Hello there!"
    When I POST JSON with:
      """json
      {
        "session_id": "<SESSION_ID>",
        "text": "Hello there!",
        "task_mode": "sync",
        "task_type": "chat"
      }
      """
    Then the response contains "duration_ms" as number
    And the response contains "task_id" as string

  Scenario: Repeat mode echoes the provided text
    Given the Heygen task endpoint "https://api.heygen.com/v1/streaming.task"
    And I set task_type to "repeat"
    When I send the task with text "Repeat this back"
    Then the avatar speaks the same text back

  Scenario: Audio must be transcribed before sending
    Given I have an audio recording of speech
    When I transcribe the audio to text using a transcription service
    And I send the transcribed text in the request body "text" field
    Then the request succeeds as a text task
    And no raw audio is sent to the Heygen task endpoint