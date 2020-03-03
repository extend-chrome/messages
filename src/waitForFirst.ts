import { Observable } from 'rxjs'
import { first } from 'rxjs/operators'

export const setupWaitForFirst = <T>(stream: Observable<T>) => (
  predicate = (() => true) as (x: T) => boolean,
) => stream.pipe(first(predicate)).toPromise()
