import { test } from 'node:test'
import assert from 'node:assert/strict'
import remarkAmazonProduct from '../plugin/index.mjs'

function para(text) {
  return { type: 'paragraph', children: [{ type: 'text', value: text }] }
}

function run(tree, options) {
  remarkAmazonProduct(options)(tree)
  return tree
}

test('rewrites a bare /dp/ URL into a card element', () => {
  const tree = { type: 'root', children: [para('https://www.amazon.com/dp/B0ABCDEFGH')] }
  run(tree)
  const node = tree.children[0]
  assert.equal(node.type, 'mdxJsxFlowElement')
  assert.equal(node.name, 'DKProductCard')
  assert.deepEqual(node.attributes, [
    { type: 'mdxJsxAttribute', name: 'asin', value: 'B0ABCDEFGH' },
  ])
})

test('rewrites /gp/product/ URLs and non-US marketplaces', () => {
  const tree = {
    type: 'root',
    children: [para('https://amazon.co.uk/gp/product/B012345678?th=1')],
  }
  run(tree)
  assert.equal(tree.children[0].type, 'mdxJsxFlowElement')
  assert.equal(tree.children[0].attributes[0].value, 'B012345678')
})

test('honors the component option', () => {
  const tree = { type: 'root', children: [para('https://www.amazon.com/dp/B0ABCDEFGH')] }
  run(tree, { component: 'ProductCard' })
  assert.equal(tree.children[0].name, 'ProductCard')
})

test('leaves inline URLs inside longer paragraphs alone', () => {
  const tree = {
    type: 'root',
    children: [para('I bought https://www.amazon.com/dp/B0ABCDEFGH and love it')],
  }
  run(tree)
  assert.equal(tree.children[0].type, 'paragraph')
})

test('leaves non-product Amazon URLs alone', () => {
  const tree = { type: 'root', children: [para('https://www.amazon.com/gp/css/order-history')] }
  run(tree)
  assert.equal(tree.children[0].type, 'paragraph')
})

test('leaves markdown-linked URLs alone (paragraph child is a link, not text)', () => {
  const tree = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://www.amazon.com/dp/B0ABCDEFGH',
            children: [{ type: 'text', value: 'the stand' }],
          },
        ],
      },
    ],
  }
  run(tree)
  assert.equal(tree.children[0].type, 'paragraph')
})

test('rewrites every bare URL in a run of consecutive card paragraphs', () => {
  const tree = {
    type: 'root',
    children: [
      para('https://www.amazon.com/dp/B0AAAAAAA1'),
      para('https://www.amazon.com/dp/B0BBBBBBB2'),
      para('just some prose between'),
      para('https://www.amazon.com/dp/B0CCCCCCC3'),
    ],
  }
  run(tree)
  const types = tree.children.map((n) => n.type)
  assert.deepEqual(types, ['mdxJsxFlowElement', 'mdxJsxFlowElement', 'paragraph', 'mdxJsxFlowElement'])
})
