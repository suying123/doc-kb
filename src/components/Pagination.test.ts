import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from './Pagination.vue'

function mountPagination(page: number, totalPages: number, total = 100) {
  return mount(Pagination, {
    props: { page, total, totalPages, pageSize: 10 },
  })
}

describe('Pagination', () => {
  it('renders the current range text', () => {
    const wrapper = mountPagination(2, 10)

    expect(wrapper.text()).toContain('第 11-20 条，共 100 条')
  })

  it('emits update:page when navigating', async () => {
    const wrapper = mountPagination(2, 10)
    const buttons = wrapper.findAll('button')

    await buttons[0]?.trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([1])

    await wrapper.setProps({ page: 1 })
    await buttons[buttons.length - 1]?.trigger('click')
    expect(wrapper.emitted('update:page')?.[1]).toEqual([2])
  })

  it('disables previous on the first page and next on the last page', () => {
    const first = mountPagination(1, 10)
    const firstButtons = first.findAll('button')
    expect(firstButtons[0]?.attributes('disabled')).toBeDefined()

    const last = mountPagination(10, 10)
    const lastButtons = last.findAll('button')
    expect(lastButtons[lastButtons.length - 1]?.attributes('disabled')).toBeDefined()
  })

  it('collapses long page ranges with ellipsis', () => {
    const wrapper = mountPagination(5, 10)

    expect(wrapper.text()).toContain('…')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('10')
  })
})
