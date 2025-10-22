import React, { useState } from 'react';
import { Card, Button, Space, Divider, Typography, Alert } from 'antd';
import type { ButtonType } from 'antd/es/button';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/* --------------- 类型定义 --------------- */
type Layer = 'L1' | 'L2' | '';
type Method = 'accounts' | 'balance' | 'disconnect' | 'connect' | 'connectionState' | 'isConnected';

interface ResultItem {
  method: string;
  layer: Layer;
  data: any;
  error?: string;
}

/* --------------- 组件 --------------- */
const L1L2Console: React.FC = () => {
  const [results, setResults] = useState<Record<string, ResultItem>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  /* 统一调用函数 */
  const call = async (layer: Layer, action: Method) => {
    const key = `${layer}_${action}`;
    setLoading({ ...loading, [key]: true });
    try {
      let data: any;
      /* 根据 layer & action 选对应的 window 方法 */
      if (action === 'accounts')
        data = await (window as any).Kaskeeper[`get${layer}Accounts`]();
      else if (action === 'balance')
        data = await (window as any).Kaskeeper[`get${layer}Balance`]();
      else if (action === 'disconnect')
        data = await (window as any).Kaskeeper[`disconnect${layer}`]();
      else if (action === 'connect')
        data = await (window as any).Kaskeeper[`connect${layer}`]();
      else if (action === 'connectionState')
        data = await (window as any).Kaskeeper[`getConnectionState`]();
      else if (action === 'isConnected')
        data = await (window as any).Kaskeeper[`is${layer}Connected`]();

      setResults({ ...results, [key]: { method: action, layer, data } });
    } catch (error: any) {
      console.error('error', error)
      setResults({
        ...results,
        [key]: { method: action, layer, data: null, error: error.message || 'Unknown error' },
      });
    } finally {
      setLoading({ ...loading, [key]: false });
    }
  };

  /* 生成按钮统一配置 */
  const buttons: Array<{ text: string; layer: Layer; action: Method; type: ButtonType }> = [
    { text: 'Get L1 Accounts', layer: 'L1', action: 'accounts', type: 'default' },
    { text: 'Get L2 Accounts', layer: 'L2', action: 'accounts', type: 'default' },
    { text: 'Get L1 Balance', layer: 'L1', action: 'balance', type: 'default' },
    { text: 'Get L2 Balance', layer: 'L2', action: 'balance', type: 'default' },
    { text: 'Disconnect L1', layer: 'L1', action: 'disconnect', type: 'default' },
    { text: 'Disconnect L2', layer: 'L2', action: 'disconnect', type: 'default' },
    { text: 'Connect L1', layer: 'L1', action: 'connect', type: 'default' },
    { text: 'Connect L2', layer: 'L2', action: 'connect', type: 'default' },
    { text: 'Get Connection State', layer: '', action: 'connectionState', type: 'default' },
    { text: 'L1 is Connected', layer: 'L1', action: 'isConnected', type: 'default' },
    { text: 'L2 is Connected', layer: 'L2', action: 'isConnected', type: 'default' },
  ];

  /* 渲染单个结果卡片 */
  /* 渲染单个结果卡片 */
const renderResult = (item: ResultItem, key: string) => (
  <Card
    size="small"
    key={key}
    title={`${item.layer} · ${item.method}`}
    extra={
      <Button
        type="text"
        size="small"
        icon={<DeleteOutlined />}
        onClick={() => {
          const { [key]: _, ...rest } = results;
          setResults(rest);
        }}
      />
    }
    style={{ marginBottom: 12 }}
  >
    {item.error ? (
      <Alert message={item.error} type="error" />
    ) : (
      <Paragraph copyable>{JSON.stringify(item.data, null, 2)}</Paragraph>
    )}
  </Card>
);

  return (
    <Card size="small" title="L1/L2 Console Info" style={{ width: 300, margin: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 按钮区 */}
        <Space wrap>
          {buttons.map(({ text, layer, action, type }) => {
            const key = `${layer}_${action}`;
            return (
              <Button
                key={key}
                type={type}
                loading={loading[key]}
                size="small"
                onClick={() => call(layer, action)}
              >
                {text}
              </Button>
            );
          })}
        </Space>

        <Divider size="small" />

        {/* 结果区 */}
        {Object.keys(results).length === 0 ? (
          <Text type="secondary">暂无数据，点击按钮开始调用</Text>
        ) : (
          Object.entries(results).map(([k, v]) => renderResult(v, k))
        )}
      </Space>
    </Card>
  );
};

export default L1L2Console;