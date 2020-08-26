import React, { useState } from 'react';
import { Select, Row, Col, Button, Radio, Cascader, Form } from 'antd';
import { useMount } from 'react-use';
import Echarts, { ECharts } from 'echarts';
import { getChartsOption } from './chartsUtils';
import { transformCodeTreeToModuleOptions, transformCodeTreeToCascaderOptions } from '@/utils/transformCodeTree';
import useCodeTree from '../analysis/dependence/states/useCodeTree';
import { SelectValue } from 'antd/lib/select';
import { Store } from 'antd/lib/form/interface';
import { queryDFMSMetricBy, DFMSMetric } from '@/api/module/code-tree';
import { useForm } from 'antd/lib/form/Form';

interface DFMS {
  key: 'module'|'package'|'class',
  stability: 'innerInstabilityAvg' | 'outerInstabilityAvg'
}

let DFMSCharts: ECharts
const Metric = () => {
  const [codeTree] = useCodeTree()
  const options = {
    module: transformCodeTreeToModuleOptions(codeTree?.value!),
    package: transformCodeTreeToCascaderOptions(codeTree?.value!, false),
    class: transformCodeTreeToCascaderOptions(codeTree?.value!, true),
  }
  const [currentKey, setCurrentKey] = useState<DFMS['key']>('module')
  const [currentModule, setCurrentModule] = useState<SelectValue>()
  const [currentStability, setCurrentStability] = useState<DFMS['stability']>('innerInstabilityAvg')
  const [dfmsMetric, setDFMSMetric] = useState<DFMSMetric>()
  const [form] = useForm()

  useMount(() => {
    DFMSCharts = Echarts.init(document.getElementById('container') as HTMLDivElement)
    DFMSCharts.setOption(getChartsOption())
  })

  const onStabilityChange = (value: DFMS['stability']) => {
    setCurrentStability(value)
    DFMSCharts.setOption(getChartsOption([dfmsMetric!.absRatio, dfmsMetric![value]]))
  }

  const onFinish = (values: Store) => {
    Object.keys(values).map(key => {
      const current = values[key]
      values[key] = typeof current === 'string' ? current : current.join('.')
    })
    queryDFMSMetricBy(currentKey, values).then((res: DFMSMetric) => {
      setDFMSMetric({...res})
      DFMSCharts.setOption(getChartsOption([res.absRatio, res[currentStability]]))
    })
  }

  return (
    <div>
      <Radio.Group
        style={{ marginBottom: '12px' }}
        value={currentKey}
        onChange={({target: { value }}) => setCurrentKey(value)}>
        <Radio.Button value="module">module</Radio.Button>
        <Radio.Button value="package">package</Radio.Button>
        <Radio.Button value="class">class</Radio.Button>
      </Radio.Group>
      <Form form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              name="moduleName"
              rules={[{
                required: true,
                message: '请选择模块',
              }]}>
              <Select
                placeholder="模块"
                style={{ width: "100%" }}
                allowClear
                showSearch
                onChange={(value) => {
                  form.setFieldsValue({
                    moduleName: value,
                    packageName: [],
                    className: [],
                  })
                  setCurrentModule(value)
                }}>
                {options['module'].map(({ value, label }) => {
                  return (
                    <Select.Option
                      value={value}
                      key={value}>
                      {label}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          { currentKey === 'package' ? (
            <Col flex="auto">
              <Form.Item
                name="packageName"
                rules={[{
                  required: true,
                  message: '请选择包名',
                }]}>
                <Cascader
                  style={{ width: '100%' }}
                  displayRender={ label => label.join('.') }
                  options={options["package"][currentModule as string]}
                  placeholder="包名"
                  notFoundContent="请先选择模块！"
                />
              </Form.Item>
            </Col>
          ) : currentKey === 'class' ? (
            <Col flex="auto">
              <Form.Item
                name="className"
                rules={[{
                  required: true,
                  message: '请选择类名',
                }]}>
                <Cascader
                  style={{ width: '100%' }}
                  displayRender={ label => label.join('.') }
                  options={options["class"][currentModule as string]}
                  placeholder="类名"
                  notFoundContent="请先选择模块！"
                />
              </Form.Item>
            </Col>
          ) : undefined}
          <Col flex="80px">
            <Form.Item>
              <Button type="primary" htmlType="submit">查询</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <div style={{ textAlign: 'center' }}>
        <Radio.Group
          value={currentStability}
          onChange={({ target: { value } }) => onStabilityChange(value)}>
          <Radio.Button value="innerInstabilityAvg" disabled={!dfmsMetric}>外部不稳定性</Radio.Button>
          <Radio.Button value="outerInstabilityAvg" disabled={!dfmsMetric}>内部不稳定性</Radio.Button>
        </Radio.Group>
      </div>
      <div
        id="container"
        style={{
          width: '800px',
          height: '800px',
          margin: '0 auto',
        }}></div>
    </div>
  )
}

export default Metric;