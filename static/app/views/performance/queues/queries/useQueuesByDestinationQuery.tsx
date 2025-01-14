import {decodeScalar} from 'sentry/utils/queryString';
import {MutableSearch} from 'sentry/utils/tokenizeSearch';
import {useLocation} from 'sentry/utils/useLocation';
import {DEFAULT_QUERY_FILTER} from 'sentry/views/performance/queues/settings';
import {useSpanMetrics} from 'sentry/views/starfish/queries/useSpanMetrics';
import {QueryParameterNames} from 'sentry/views/starfish/views/queryParameters';

type Props = {
  enabled?: boolean;
};

export function useQueuesByDestinationQuery({enabled}: Props) {
  const location = useLocation();
  const cursor = decodeScalar(location.query?.[QueryParameterNames.DESTINATIONS_CURSOR]);

  const mutableSearch = new MutableSearch(DEFAULT_QUERY_FILTER);
  const response = useSpanMetrics({
    search: mutableSearch,
    fields: [
      'messaging.destination.name',
      'count()',
      'count_op(queue.publish)',
      'count_op(queue.process)',
      'sum(span.self_time)',
      'avg(span.self_time)',
      'avg_if(span.self_time,span.op,queue.publish)',
      'avg_if(span.self_time,span.op,queue.process)',
      'avg(messaging.message.receive.latency)',
    ],
    enabled,
    sorts: [],
    limit: 10,
    cursor,
    referrer: 'api.performance.queues.destination-summary',
  });

  return response;
}
