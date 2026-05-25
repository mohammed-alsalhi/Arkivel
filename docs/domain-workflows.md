# Domain Workflows

Arkivel v4.91.2 adds preview-safe workflow metadata for starter-space products. The contract is exposed at `/api/space-workflows` and through `/api/customization` as `domainWorkflows`.

## Workflows

- **Docs portal:** versions, changelog pages, owners, reviewed dates, and public/private docs controls.
- **Team handbook:** policies, acknowledgements, owners, review cycles, and onboarding paths.
- **Worldbuilding:** canon status, timelines, maps, factions, locations, characters, and continuity checks.
- **Research:** citations, evidence, confidence, experiments, literature notes, and bibliography exports.
- **Personal wiki:** inbox, daily notes, reading list, projects, and evergreen notes.

Each workflow links to a starter template id, declares expected controls, lists a practical workflow sequence, and defines release gates that self-host admins can turn into checklists or dashboard widgets.
