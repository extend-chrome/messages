export const Tab = ({
  id,
  index = 0,
  pinned = false,
  highlighted = false,
  windowId = 0,
  active = true,
  incognito = false,
  selected = true,
  discarded = false,
  autoDiscardable = true,
  ...rest
}: {
  id: number
  [propName: string]: any
}): chrome.tabs.Tab => ({
  id,
  index,
  pinned,
  highlighted,
  windowId,
  active,
  incognito,
  selected,
  discarded,
  autoDiscardable,
  ...rest,
})
