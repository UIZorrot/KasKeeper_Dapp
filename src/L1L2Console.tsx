import React, { useState } from 'react';
import { Card, Button, Space, Divider, Typography, Alert } from 'antd';
import type { ButtonType } from 'antd/es/button';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/* --------------- 类型定义 --------------- */
type Layer = 'L1' | 'L2';
type Method = 'accounts' | 'balance' | 'disconnect';

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
      else
        data = await (window as any).Kaskeeper[`disconnect${layer}`](); // 返回一般无意义

      setResults({ ...results, [key]: { method: action, layer, data } });
    } catch (e: any) {
      setResults({
        ...results,
        [key]: { method: action, layer, data: null, error: e.message || 'Unknown error' },
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