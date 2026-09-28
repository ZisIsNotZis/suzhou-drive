# Make collisions stable and preserve vehicle heading

Status: needs-triage
Type: task

Verify collision response for trees, poles, buildings, and traffic cars. Earlier behavior included teleportation, jitter, position swapping, and unexpected camera rotation.

Acceptance criteria:

- No teleportation, jitter, or position swapping on impact.
- Elastic response uses mass and configurable collision energy loss.
- Static map objects behave as infinite-mass bodies.
- Vehicle heading, movement vector, and camera orbit remain independent after impact.
- A focused Playwright E2E test reproduces and verifies each regression class.
