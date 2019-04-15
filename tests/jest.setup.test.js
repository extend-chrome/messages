test('chrome is mocked', () => {
  expect(chrome).toBeDefined()
})

test('chromep to be promisified', () => {
  expect(chromep.runtime.getBackgroundPage()).toBeInstanceOf(
    Promise,
  )

  expect(chromep.notifications.create({})).toBeInstanceOf(
    Promise,
  )
})
