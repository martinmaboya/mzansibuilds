# MzansiBuilds UML Diagrams

Prepared for Derivco Code Skills Quest - Project Profiling

## Use Case Diagram - core developer journey and system interactions

System: MzansiBuilds

```mermaid
flowchart LR
    A[Developer]
    S((MzansiBuilds System))

    UC1((Register account))
    UC2((Login))
    UC3((Manage profile))
    UC4((Create project))
    UC5((Update / delete own project))
    UC6((Set project stage and support required))
    UC7((View public feed))
    UC8((Comment on project))
    UC9((Raise hand for collaboration))
    UC10((Add milestone / progress update))
    UC11((Mark project as completed))
    UC12((View Celebration Wall))

    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
    A --> UC10
    A --> UC11
    A --> UC12

    UC2 -.-> UC4
    UC4 -.-> UC6
    UC6 -.-> UC10
    UC10 -.-> UC7
    UC11 -.-> UC12
    S --- UC1
    S --- UC2
    S --- UC3
    S --- UC4
    S --- UC5
    S --- UC6
    S --- UC7
    S --- UC8
    S --- UC9
    S --- UC10
    S --- UC11
    S --- UC12
```

Dashed arrows indicate follow-on interactions within the MVP workflow.
