// The motion clips that play inside the app's onboarding. No script and no voice: each id
// is a composition of its own (CoreLoop.tsx, ChatLoop.tsx, AhaLoop.tsx), listed here so render-pancho.mjs can find it.
export const ONBOARDING = [
  {id: 'onb-core'}, // the four things the app does, on a loop
  {id: 'onb-chat'}, // the chat with Pancho: say it out loud, get corrected, learn the local way
  {id: 'onb-aha'}, // "Correct… in a textbook": one sentence, and three of its four words change in Buenos Aires
  // "Your course": the feature loop with one learner's own chat, words and custom in it (CourseLoop.tsx)
  ...['trip', 'moving', 'love', 'people', 'culture'].flatMap(why => ['learner', 'speaker'].map(tier => ({id: `onb-course-${why}-${tier}`, why, tier}))),
];
export const COURSES = ONBOARDING.filter(r => r.id.startsWith('onb-course-'));
