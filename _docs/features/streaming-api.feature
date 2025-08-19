Feature: Heygen Streaming API integration via Next.js routes
  As a user of the Interactive Avatar demo
  I want Next.js API routes that proxy the Heygen streaming endpoints
  So that the frontend can create and manage live interactive avatar sessions reliably

  # Implementation references
  # - New Session: app/api/streaming/new/route.ts -> POST /v1/streaming.new
  # - Active Sessions: app/api/streaming/list/route.ts -> GET /v1/streaming.list
  # - Sessions History: app/api/streaming/history/route.ts -> GET /v2/streaming.list
  # - Send Task: app/api/streaming/task/route.ts -> POST /v1/streaming.task
  # - Stop Session: app/api/streaming/stop/route.ts -> POST /v1/streaming.stop
  # - Interrupt Task: app/api/streaming/interrupt/route.ts -> POST /v1/streaming.interrupt
  # - Keep Alive: app/api/streaming/keep-alive/route.ts -> POST /v1/streaming.keep_alive
  # - Voices (v2): app/api/voices/route.ts -> GET /v2/voices
  # - Avatars: app/api/avatars/route.ts -> GET /v1/streaming/avatar.list
  # - Client hooks: lib/services/streaming/query.ts
  # - Query keys: lib/query/keys.ts
  # - Zod Schemas: lib/schemas/api/heygen/index.ts
  #   - Streaming: lib/schemas/api/heygen/streaming.ts
  #   - Voices: lib/schemas/api/heygen/voices.ts
  #   - Avatars: lib/schemas/api/heygen/avatars.ts
  #   - Token: lib/schemas/api/heygen/token.ts
  # - Start Session Button (create new streaming session): components/AvatarConfig/components/StartSessionButton.tsx
  # - Chat Input (send chat task text): components/AvatarSession/ChatInput.tsx
  # - Chat Container/Layout switch (show chat mode when session active): components/AvatarSession/Chat.tsx
  # - Interrupt Button (interrupt avatar speech): components/AvatarSession/AvatarControls.tsx
  # - Stop Button (stop active session): components/AvatarSession/AvatarControls.tsx
  # - Sessions list in Sidebar (fetch/list sessions & chats): components/Sidebar/ConversationsSection.tsx
  #   - Related: components/Sidebar/MessagesSection.tsx
  # - Heygen client/service: lib/services/heygen.ts
  #
  # UI wiring plan (to implement next)
  # - Session state (toggle chat layout when active): lib/stores/session.ts
  # - Start new streaming session -> open chat:
  #   components/AvatarConfig/components/StartSessionButton.tsx
  #     - POST /api/streaming/new
  #     - validate with NewSessionResponseSchema
  #     - set active session in lib/stores/session.ts
  #     - trigger chat layout in components/AvatarSession/Chat.tsx
  # - Send chat prompt:
  #   components/AvatarSession/ChatInput.tsx
  #     - POST /api/streaming/task (SendTaskRequestSchema)
  # - Interrupt avatar speech:
  #   components/AvatarSession/AvatarControls.tsx
  #     - POST /api/streaming/interrupt (InterruptRequestSchema)
  # - Stop active session:
  #   components/AvatarSession/AvatarControls.tsx
  #     - POST /api/streaming/stop (StopSessionRequestSchema)
  #     - clear active session in lib/stores/session.ts
  # - Sidebar sessions listing (for now: fetch, no-op on click):
  #   components/Sidebar/ConversationsSection.tsx
  #     - GET /api/streaming/list
  #     - validate with ActiveSessionsResponseSchema
  #     - render basic list (placeholder, no selection yet)

  Background:
    Given the environment variable "HEYGEN_API_KEY" is configured
    And the optional "NEXT_PUBLIC_BASE_API_URL" is set to "https://api.heygen.com"

  @smoke @sessions
  Scenario: Start a new streaming session
    When I POST to "/api/streaming/new" with JSON body:
      """
      {
        "quality": "medium",
        "video_encoding": "VP8",
        "version": "v2",
        "stt_settings": {"provider": "deepgram", "confidence": 0.55},
        "activity_idle_timeout": 120
      }
      """
    Then the response status should be 200
    And the JSON should contain:
      | path                          |
      | data.session_id               |
      | data.url                      |
      | data.access_token             |
      | data.session_duration_limit   |
    # Example response payload:
    # {
    #   "code": 100,
    #   "message": "Success",
    #   "data": {
    #     "session_id": "sess_1234567890",
    #     "url": "wss://heygen-xxxx.livekit.cloud",
    #     "access_token": "eyJhbGciOi...",
    #     "session_duration_limit": 600,
    #     "is_paid": true,
    #     "realtime_endpoint": "wss://webrtc-signaling.heygen.io/v2-alpha/abcdef"
    #   }
    # }

  @sessions @list
  Scenario: List active sessions
    When I GET "/api/streaming/list"
    Then the response status should be 200
    And the JSON should contain an array at "sessions"
    And each item should contain:
      | path                |
      | sessions[].session_id |
      | sessions[].status     |
      | sessions[].created_at |
    # Example response payload:
    # {
    #   "sessions": [
    #     { "session_id": "sess_1", "status": "connected", "created_at": 1723590000 },
    #     { "session_id": "sess_2", "status": "connecting", "created_at": 1723590500 }
    #   ]
    # }

  @sessions @history
  Scenario Outline: Fetch sessions history with pagination
    When I GET "/api/streaming/history?page=<page>&page_size=<page_size>"
    Then the response status should be 200
    And the JSON should contain:
      | path            |
      | total           |
      | page            |
      | page_size       |
      | data            |
    And each item in "data" should contain:
      | path            |
      | data[].session_id |
      | data[].status     |
      | data[].created_at |
    # Example response payload:
    # {
    #   "total": 27,
    #   "page": 1,
    #   "page_size": 10,
    #   "next_pagination_token": "token_abc",
    #   "data": [
    #     {
    #       "session_id": "sess_1",
    #       "status": "connected",
    #       "created_at": 1723500000,
    #       "api_key_type": "server",
    #       "duration": 180,
    #       "avatar_id": "avatar_123",
    #       "voice_name": "Lily"
    #     }
    #   ]
    # }

    Examples:
      | page | page_size |
      | 1    | 10        |

  @task
  Scenario: Send a chat task to the avatar (sync)
    Given I have a valid session_id from a new session
    When I POST to "/api/streaming/task" with JSON body:
      """
      {
        "session_id": "<SESSION_ID>",
        "text": "Hello there!",
        "task_mode": "sync",
        "task_type": "chat"
      }
      """
    Then the response status should be 200
    And the JSON should contain "task_id"
    # Example response payload:
    # {
    #   "duration_ms": 2450.5,
    #   "task_id": "task_987654321"
    # }

  @stop
  Scenario: Stop an active session
    Given I have a valid session_id from a new session
    When I POST to "/api/streaming/stop" with JSON body:
      """
      {"session_id": "<SESSION_ID>"}
      """
    Then the response status should be 200
    # Example response payload:
    # { "status": "success" }

  @interrupt
  Scenario: Interrupt current avatar speech
    Given I have a valid session_id from a new session
    When I POST to "/api/streaming/interrupt" with JSON body:
      """
      {"session_id": "<SESSION_ID>"}
      """
    Then the response status should be 200
    # Example response payload:
    # { "status": "success" }

  @keepalive
  Scenario: Keep an idle session alive
    Given I have a valid session_id from a new session
    When I POST to "/api/streaming/keep-alive" with JSON body:
      """
      {"session_id": "<SESSION_ID>"}
      """
    Then the response status should be 200
    # Example response payload:
    # { "code": 100, "message": "Success" }

  @voices
  Scenario: List available voices (v2)
    When I GET "/api/voices"
    Then the response status should be 200
    And the JSON should contain an array at "voices"
    # Example response payload:
    # {
    #   "voices": [
    #     {
    #       "voice_id": "voice_en_1",
    #       "language": "en",
    #       "gender": "Female",
    #       "name": "Ava",
    #       "preview_audio": "https://.../preview.mp3",
    #       "support_pause": true,
    #       "emotion_support": true,
    #       "support_locale": true
    #     }
    #   ]
    # }

  @avatars
  Scenario: List available streaming avatars
    When I GET "/api/avatars"
    Then the response status should be 200
    And the JSON should contain an array at "data"
    # Example response payload:
    # {
    #   "code": 100,
    #   "message": "Success",
    #   "data": [
    #     {
    #       "avatar_id": "avatar_123",
    #       "created_at": 1723500000,
    #       "default_voice": "voice_en_1",
    #       "is_public": true,
    #       "normal_preview": "https://.../avatar.png",
    #       "pose_name": "Friendly",
    #       "status": "ACTIVE"
    #     }
    #   ]
    # }
