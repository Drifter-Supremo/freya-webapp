# Freya AI Chat - Technical Context

## Technology Stack Overview

Freya is built using a modern web technology stack with cloud-based services:

| Layer | Technologies |
|-------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **UI Design** | Custom CSS with CSS variables for theming |
| **AI Backend** | Tuned Freya 2.0 (Vertex AI Endpoint) |
| **Database** | Firebase Firestore |
| **API Security** | Client-side localStorage for API key management |
| **Deployment** | Local development (future: web hosting) |
| **Planned Integrations** | Model Context Protocol (MCP), NBA API |

## Core Technologies

### Frontend Web Technologies

The application uses vanilla HTML, CSS, and JavaScript without a framework dependency. This approach was chosen to:

- Minimize dependencies and loading time
- Showcase fundamental web development skills
- Provide a lightweight application footprint
- Simplify maintenance and updates

Key frontend features include:
- Responsive design that works across device sizes
- Dark/light theme toggle with persistent preference
- Dynamic message rendering with animations
- Custom SVG avatars embedded as base64 data URIs
- Modern CSS features (variables, flexbox, grid)
- Modal dialog for API key management

### Firebase Integration

Firebase Firestore serves as the database backend for Freya's conversation memory, using a dual-collection approach:

#### Collections Structure
1. **Conversations Collection**:
   ```typescript
   interface ConversationDocument {
     userId: string;              // Hardcoded to "Sencere" for now
     messages: Message[];         // Array of message objects
     summary: string;            // Placeholder for future use
     createdAt: Timestamp;       // Server timestamp
   }

   interface Message {
     role: "user" | "assistant"; // Message sender role
     content: string;           // Message text content
     timestamp: Timestamp;      // Server timestamp
     imageURL: string | null;   // For future media support
   }
   ```

2. **Legacy Messages Collection** (maintained for compatibility):
   ```typescript
   interface MessageDocument {
     user: string;     // User message content
     freya: string;    // Freya's response content
     timestamp: Timestamp;
   }
   ```

3. **User Facts Collection**:
   ```typescript
   interface UserFactDocument {
     type: string;     // Fact category (job, location, etc.)
     value: string;    // The actual fact content
     timestamp: Timestamp;
   }
   ```

#### Implementation Details
- **Dual Storage Strategy**:
  - New messages stored in both formats for backward compatibility
  - Memory system searches both collections for comprehensive context
  - Gradual migration path for future updates

- **Performance Optimizations**:
  - Messages array limited to recent exchanges
  - Timestamp-based ordering for efficient retrieval
  - Server-side timestamps for consistency
  - Unique IDs prevent duplicate facts

- **Resilience Features**:
  - Graceful degradation on connection failure
  - Error handling for failed operations
  - Automatic reconnection handling
  - Data validation before storage

- **Technical Specifications**:
  - Using Firebase SDK v9 compatibility version
  - NoSQL document database architecture
  - Real-time capabilities (though not currently used)
  - Built-in authentication support (for future use)

### Memory System Architecture

The application implements a sophisticated 3-tier memory system:

#### Tier 1: User Facts Database
- **Purpose**: Long-term storage of user information
- **Implementation**:
  - Pattern-based fact extraction from conversations
  - Structured storage in Firestore
  - Categorized fact types (job, location, interests, etc.)
  - Relevance-based retrieval
- **Features**:
  - Automatic fact extraction
  - Deduplication through unique IDs
  - Category-based organization
  - Relevance scoring for retrieval

#### Tier 2: Recent Conversation History
- **Purpose**: Maintain immediate conversation context
- **Implementation**:
  - Current conversation tracking
  - Recent message storage
  - Role-based message organization
  - Chronological ordering
- **Features**:
  - Message role mapping
  - Timestamp-based ordering
  - Format standardization
  - Context continuity

#### Tier 3: Topic-based Memory
- **Purpose**: Contextual recall of relevant past conversations
- **Implementation**:
  - Topic extraction from current message
  - Historical conversation search
  - Relevance scoring system
  - Selective inclusion
- **Features**:
  - Keyword-based topic matching
  - Cross-conversation search
  - Relevance-based filtering
  - Context-aware inclusion

### AI Backend (Vertex AI)

Freya uses a tuned Freya 2.0 model hosted on a Vertex AI Endpoint:

- **Model**: Tuned Freya 2.0 via Vertex AI Endpoint (`projects/741580083810/locations/us-central1/endpoints/1976575560578498560`)
- **Integration**: Direct REST API calls using x-goog-api-key authentication
- **API Key Management**: Client-side localStorage storage with AIza key format validation
- **Prompt Engineering**: Enhanced system prompt with refined personality structure:
  - Core identity and backstory foundation
  - Conversational flow patterns for more natural text-like responses
  - Emotional depth guidelines for more meaningful engagement
  - Response length flexibility based on context (brief for casual, detailed for emotional)
  - Extensive examples of good vs. bad responses for different situations
- **Context Management**: Three-tier memory architecture with Gemini-compatible message format:
  - Messages transformed into contents array with role-based parts
  - User/assistant roles mapped to user/model in Gemini format
  - Each message wrapped in parts array with text content
- **Configuration Parameters**:
  - Temperature: 0.7 (reduced from 1.1 for better focus and coherence)
  - MaxOutputTokens: 800 (balanced length for meaningful responses)
  - Rationale:
    * Lower temperature provides more controlled responses
    * Maintains personality while reducing verbosity
    * Better balance between creativity and focus
    * Improved topic adherence and consistency

### API Key Management System

A secure client-side API key management system has been implemented:

- **Storage Mechanism**: Browser's localStorage for persistent storage
- **Access Control**: JavaScript functions (getGeminiKey, setGeminiKey) for controlled access
- **User Interface**: Modal dialog for secure Gemini API key entry and validation
- **Validation**: Client-side key format verification (AIza... pattern with 35 chars)
- **Error Handling**: 
  - Status code 401/403 detection for invalid credentials
  - Automatic key clearing on authentication failure 
  - Re-prompting when keys are invalid or missing
  - Clear user feedback messages referencing Gemini API
- **Security Considerations**:
  - Keys are stored only on the client device
  - No server-side transmission of keys beyond API requests
  - Clear user feedback about key storage practices

This approach provides a balance of security and convenience for an application running primarily as a personal tool without requiring a backend proxy server.

### Styling and UI Design

The UI follows a retro-futuristic "Raygun Gothic" aesthetic:

- **Color Scheme**: Teals and pinks on dark backgrounds (dark theme default)
- **Typography**: 'Orbitron' for headers, 'Quicksand' for body text
- **Visual Elements**: Saturn rings, circuit patterns, sci-fi design elements
- **Animations**: Subtle fade, pulse, and typing animations
- **Theme System**: CSS variables with theme toggle functionality
- **Iconography**: Font Awesome for UI controls
- **Modal Dialog**: Styled API key input modal consistent with overall design

## Development Environment

### Tools & Utilities
- **Version Control**: Git (implied)
- **Code Editor**: VSCode with syntax highlighting
- **Browser DevTools**: For testing and debugging
- **Local Server**: Simple HTTP server for development

### Project Structure
```
freya-webapp/
├── index.html            # Main application HTML
├── style.css            # Application styling
├── script.js            # Core application logic
├── readme.md            # Project documentation
├── Freya-personality.txt # Character reference document
├── images/              # Image assets folder
│   ├── freya-avatar.svg # Freya's avatar graphic
│   └── wolf-avatar.txt  # User avatar text reference
└── memory-bank/         # Documentation center
    ├── projectbrief.md  # Project overview
    ├── productContext.md # Product vision and goals
    └── ...              # Additional documentation
```

## Planned Technical Additions

### MCP (Model Context Protocol) Integration

Planned implementation of MCP will include:

- **MCP Server**: Local server providing NBA data access tools
- **API Integration**: Connections to sports data providers
- **Tool Definition**: Custom tools for fetching scores, standings, news
- **Context Enhancement**: Seamless integration into Freya's knowledge
- **Configuration**: Custom environment variables for API keys

### Memory System Enhancements

Future improvements to the memory system may include:

- **Topic Extraction**: Enhanced topic detection and categorization
- **Memory Optimization**: More efficient storage and retrieval patterns
- **Context Weighting**: Improved relevance scoring for memory inclusion
- **Cross-referencing**: Better linking between related memories
- **Hybrid Approaches**: Selective summarization for specific use cases

### Technical Constraints & Considerations

1. **Browser Compatibility**: The application targets modern browsers with ES6 support
2. **API Rate Limits**: OpenAI GPT-4o API has usage quotas and cost considerations for scaling
3. **Firebase Free Tier**: Currently using Firebase's free tier with associated limits
4. **Client-Side Processing**: All processing happens in the browser, with potential performance implications
5. **API Key Security**: Client-side key storage is appropriate for personal use but has limitations for wider deployment

## Technology Selection Rationale

### Why Vanilla JavaScript?
- Demonstrates core programming skills without framework abstraction
- Reduces bundle size and loading times
- Simplifies the codebase for portfolio demonstration purposes
- Avoids framework-specific paradigms and learning curves for reviewers

### Why Firebase?
- Provides database functionality without need for custom backend
- Offers real-time capabilities if needed in the future
- Includes authentication that could be added later
- Has a generous free tier for development and demos

### Why Tuned Freya 2.0 (Vertex AI)?
- **Tuned Model**: Offers enhanced personality consistency and specific conversational nuances tailored for Freya.
- **Vertex AI Endpoint**: Provides a stable and scalable hosting solution for the tuned model.
- **Advanced Capabilities**: The model offers strong language understanding and generation.
- **Structured History**: Supports role-based message history for context.
- **Cost-Effectiveness**: Utilizes a custom-trained model for optimized performance and cost.

### Why Client-Side API Key Management?
- Simplifies deployment without requiring backend server infrastructure
- Provides appropriate security for personal portfolio projects
- Allows users to use their own API keys rather than sharing credentials
- Maintains clean separation of concerns with clear authentication flow
- Balances security with ease of use for development and demonstration purposes
- Provides clear feedback and graceful error handling for authentication issues
