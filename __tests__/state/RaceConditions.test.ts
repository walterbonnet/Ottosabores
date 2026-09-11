describe('Async Race Condition Protection Tests', () => {
  class SequentialRequestTracker {
    private currentSeq = 0;

    public nextSequence(): number {
      this.currentSeq += 1;
      return this.currentSeq;
    }

    public isLatest(seq: number): boolean {
      return seq === this.currentSeq;
    }
  }

  it('ignores out-of-order older search responses when a newer query has been dispatched', async () => {
    const tracker = new SequentialRequestTracker();
    const finalState: { query: string; results: string[] } = { query: '', results: [] };

    // Request 1: "c"
    const seq1 = tracker.nextSequence();
    const promise1 = new Promise<{ seq: number; query: string; data: string[] }>((resolve) => {
      setTimeout(() => resolve({ seq: seq1, query: 'c', data: ['Chipá', 'Carne'] }), 300);
    });

    // Request 2: "ch"
    const seq2 = tracker.nextSequence();
    const promise2 = new Promise<{ seq: number; query: string; data: string[] }>((resolve) => {
      setTimeout(() => resolve({ seq: seq2, query: 'ch', data: ['Chipá'] }), 100);
    });

    // Promise 2 resolves first (100ms)
    const res2 = await promise2;
    if (tracker.isLatest(res2.seq)) {
      finalState.query = res2.query;
      finalState.results = res2.data;
    }

    expect(finalState.query).toBe('ch');
    expect(finalState.results).toEqual(['Chipá']);

    // Promise 1 resolves later (300ms) - should be ignored!
    const res1 = await promise1;
    if (tracker.isLatest(res1.seq)) {
      finalState.query = res1.query;
      finalState.results = res1.data;
    }

    // State MUST remain query "ch", NOT overwritten by stale query "c"
    expect(finalState.query).toBe('ch');
    expect(finalState.results).toEqual(['Chipá']);
  });
});
