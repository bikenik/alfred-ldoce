import test from 'ava'
// import alfyTest from 'alfy-test'

test('foo', t => {
	t.pass()
})

test('bar', async t => {
	const bar = Promise.resolve('bar')

	t.is(await bar, 'bar')
})

// test('`items` property is array', async t => {
// 	const items = await t.context.alfy('!set')

// 	t.true(Array.isArray(items))
// 	t.true(items.length > 0)
// })

// test('main test', async t => {
// 	const alfy = alfyTest()
// 	const result = await alfy('qui')

// 	t.deepEqual(result, [
// 		{
// 			title: 'qui est esse'
// 		}
// 	])
// })
