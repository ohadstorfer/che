// ---------------------------------------------------------------------------
// The lesson she has just finished, handed from the lesson to the road.
//
// The road reads her progress again when she comes back to it, and that read
// is a round trip: until it lands the road stands on the step she just left,
// and only then plays the advance — seconds of the old road, then a jump. The
// lesson already knows it was saved, so it says so here, and the road starts
// the advance at once; the real read confirms it behind (and changes nothing).
// Only a lesson whose end the server has acknowledged is ever put here.
// ---------------------------------------------------------------------------

let finished: string | null = null;

/** A lesson whose end was saved: the road may count it done right away. */
export function markLessonFinished(lessonId: string) {
  finished = lessonId;
}

/** The lesson just finished, if any — once. */
export function takeFinishedLesson(): string | null {
  const id = finished;
  finished = null;
  return id;
}
