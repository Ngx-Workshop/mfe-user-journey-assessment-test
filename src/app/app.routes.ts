import { inject } from '@angular/core';
import { CanActivateFn, Params, RedirectFunction, Route, Router, UrlSegment } from '@angular/router';
import App from './app';
import { protectJourneyParams } from './features/assessment-test/pages/journey/journey-navigation';

const legacyDestination = (queryParams: Params, matchedSegments?: UrlSegment[]) => {
  const router = inject(Router);
  const tree = router.parseUrl(router.getCurrentNavigation()?.extractedUrl.toString() ?? '/');
  const segments = matchedSegments?.slice() ?? tree.root.children['primary']?.segments.slice() ?? [];
  if (segments.at(-1)?.path === 'overview') segments.pop();
  const view = queryParams['view'];
  const destination = (view === 'attempt' || view === 'result') && queryParams['attempt']
    ? [view === 'result' ? 'results' : 'attempts', queryParams['attempt']]
    : (view === 'subject' && queryParams['subject'])
      ? ['subjects', queryParams['subject']]
      : [view === 'history' ? 'history' : 'overview'];
  const path = [...segments, ...destination.map(part => new UrlSegment(part, {}))];
  const target = router.parseUrl('/' + path.map(segment => segment.toString()).join('/'));
  target.queryParams = { ...queryParams };
  for (const key of ['view', 'subject', 'attempt']) delete target.queryParams[key];
  target.fragment = tree.fragment;
  return target;
};

const legacyEntry: RedirectFunction = ({ queryParams }) => legacyDestination(queryParams);
const migrateLegacyState: CanActivateFn = next =>
  ['view', 'subject', 'attempt'].some(key => key in next.queryParams) ? legacyDestination(next.queryParams, next.pathFromRoot.flatMap(route => route.url)) : true;

export const Routes: Route[] = [
  { path: '', redirectTo: legacyEntry, pathMatch: 'full' },
  ...[
    { path: 'overview', view: 'overview' },
    { path: 'subjects/:subjectId', view: 'subject' },
    { path: 'history', view: 'history' },
    { path: 'attempts/:attemptId/review', view: 'attempt', review: true },
    { path: 'attempts/:attemptId', view: 'attempt' },
    { path: 'results/:attemptId', view: 'result' },
  ].map(({ path, view, review }): Route => ({
    path, component: App, data: { view, review: !!review },
    canActivate: [...(view === 'overview' ? [migrateLegacyState] : []), protectJourneyParams], runGuardsAndResolvers: 'always',
    canDeactivate: [(app: App) => app.vm.canLeave()],
  })),
  { path: '**', redirectTo: 'overview' },
];
