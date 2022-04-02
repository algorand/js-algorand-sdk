import { Numeric } from '../../../types';
import JSONRequest from '../jsonrequest';

export default class SearchForApplications extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/applications';
  }

  // application ID for filter, as int
  index(index: Numeric) {
    this.query['application-id'] = index;
    return this;
  }

  // creator for filter, as string
  creator(creator: string) {
    this.query.creator = creator;
    return this;
  }

  // token for pagination
  nextToken(next: string) {
    this.query.next = next;
    return this;
  }

  // limit results for pagination
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  // include all items including closed accounts, deleted applications, destroyed assets, opted-out asset holdings, and closed-out application localstates
  includeAll(value = true) {
    this.query['include-all'] = value;
    return this;
  }
}
