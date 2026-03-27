export class AISolverTracker {
  constructor() {
    this.runs = [];
  }

  record(run) {
    this.runs.unshift({
      ...run,
      createdAt: Date.now(),
    });
  }

  clear() {
    this.runs = [];
  }

  latest() {
    return this.runs.length > 0 ? this.runs[0] : null;
  }
}
