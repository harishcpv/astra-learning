# Astra architecture

This diagram shows the current offline-first learning loop. The browser UI collects a topic and learner profile, the local learning engine produces the structured JSON contract, and the practice evidence can trigger a human coach review.

```mermaid
flowchart LR
    Tenant["Tenant workspace"] --> Profile["Learner profile<br/>level · goal · schedule"]
    Topic["Any topic"] --> Input["Topic + profile form"]
    Profile --> Input

    Input --> UI["Astra GUI"]
    UI --> Engine["Learning engine<br/>gui/learning-engine.js"]

    Engine --> Plan["Study plan<br/>4 progressive modules"]
    Engine --> Bank["Question bank<br/>MCQ · short answer · scenario"]
    Engine --> Insights["Coach insights<br/>focus · struggle points · trigger"]
    Engine --> JSON["Structured JSON payload"]

    Plan --> Notes["Markdown notes + takeaways"]
    Bank --> Practice["Interactive practice"]
    Practice --> Attempt["Answer + explanation"]
    Attempt --> State["Local progress state"]
    State --> Decision{"Two consecutive misses?"}

    Decision -->|No| Continue["Continue learning path"]
    Continue --> Practice
    Decision -->|Yes| Flag["Coach flag"]
    Insights --> Flag
    Flag --> Coach["Human coach review"]
    Coach --> Intervention["Targeted re-teach<br/>or smaller next step"]
    Intervention --> Practice

    JSON --> Preview["JSON preview"]
    JSON --> Download["Copy or download .json"]

    classDef core fill:#efefff,stroke:#6a66f5,color:#273046;
    classDef evidence fill:#e9f8f2,stroke:#13a88a,color:#273046;
    classDef coach fill:#fff1e9,stroke:#dc8b5f,color:#273046;
    classDef output fill:#f5f4ff,stroke:#9b97ee,color:#273046;

    class Input,UI,Engine core;
    class Plan,Bank,Notes,Practice,Attempt,State,Continue evidence;
    class Insights,Decision,Flag,Coach,Intervention coach;
    class JSON,Preview,Download output;
```

## Runtime boundaries

- **Tenant and learner context:** represented in the workspace UI; persistence and authentication are deferred.
- **Learning engine:** deterministic and offline in this prototype. It can later be replaced behind the same `generateLearningExperience(profile)` interface.
- **Practice state:** kept in browser memory for the current session.
- **Coach handoff:** triggered by the local rule of two consecutive misses, while the coach retains decision authority.
- **Payload:** follows the documented `topic_metadata`, `study_plan`, `question_bank`, and `coach_insights` contract.
