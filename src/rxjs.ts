import { Observable } from 'rxjs'

export const message$: Observable<
  [JsonifiableData, SendResponse]
> = new Observable((subscriber) => {})

export const onlyMessage$: Observable<
  JsonifiableData
> = new Observable((subscriber) => {})
