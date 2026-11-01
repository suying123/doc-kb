import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DocStatus from './DocStatus.vue'
import type { DocStatus as Status } from '@/types'

const cases: Array<[Status, string]> = [
  ['pending', '待处理'],
  ['processing', '处理中'],
  ['ready', '已完成'],
  ['failed', '处理失败'],
]

describe('DocStatus', () => {
  it.each(cases)('renders the label for %s', (status, label) => {
    const wrapper = mount(DocStatus, { props: { status } })

    expect(wrapper.text()).toContain(label)
    expect(wrapper.find('.badge').classes()).toContain(status)
  })

  it('shows progress only for processing documents', () => {
    const processing = mount(DocStatus, {
      props: { status: 'processing', progress: 60, showProgress: true },
    })
    expect(processing.find('.progress-text').text()).toBe('60%')
    expect(processing.find('.progress-bar').attributes('style')).toContain('width: 60%')

    const ready = mount(DocStatus, {
      props: { status: 'ready', progress: 100, showProgress: true },
    })
    expect(ready.find('.progress').exists()).toBe(false)
  })

  it('clamps progress into the 0-100 range', () => {
    const over = mount(DocStatus, {
      props: { status: 'processing', progress: 120, showProgress: true },
    })
    expect(over.find('.progress-text').text()).toBe('100%')

    const under = mount(DocStatus, {
      props: { status: 'processing', progress: -10, showProgress: true },
    })
    expect(under.find('.progress-text').text()).toBe('0%')
  })
})
